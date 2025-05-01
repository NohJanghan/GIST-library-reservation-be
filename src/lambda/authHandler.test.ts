import { authHandler, postAuthHandler } from "./authHandler";
import { AuthService } from "../domain/auth/authService";
import { Auth, InvalidCredentialsException } from "../domain/auth/auth";
import type { APIGatewayProxyEventV2 } from "aws-lambda";

// getAuthHandler import 추가를 위한 mock (실제 구현 전까지)
jest.mock("./authHandler", () => {
    const actual = jest.requireActual("./authHandler");
    return {
        ...actual,
        getAuthHandler: jest.fn().mockImplementation(async () => ({
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "authenticated" })
        }))
    };
});

// authHandler 테스트 추가
describe("authHandler", () => {
    // Arrange
    const createEvent = (method: string, body?: string): APIGatewayProxyEventV2 => ({
        requestContext: { http: { method, path: "/auth" } } as any,
        body,
    } as any);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should call postAuthHandler for POST requests", async () => {
        // Arrange
        const event = createEvent("POST", JSON.stringify({ userId: "user", userPwd: "pass" }));

        // Act
        const res = await authHandler(event);

        // Assert
        expect(res).toBeDefined();
        // POST 메소드이므로 응답이 반환됨
        expect(res.statusCode).not.toBe(400);
    });

    it("should call getAuthHandler for GET requests in the future", async () => {
        // Arrange
        const event = createEvent("GET");

        // Act
        const res = await authHandler(event);

        // Assert - 현재는 GET이 구현되지 않아 405을 반환해야 함
        expect(res.statusCode).toBe(405);
        expect(JSON.parse(res.body as string).message).toBe("Method Not Allowed");

        // getAuthHandler 구현 후 아래 주석을 해제하세요
        // const res = await authHandler(event);
        // expect(res.statusCode).toBe(200);
        // expect(JSON.parse(res.body as string).status).toBe("authenticated");
    });

    it("should return 405 for unsupported HTTP methods", async () => {
        // Arrange
        const methods = ["PUT", "DELETE", "PATCH"];

        for (const method of methods) {
            // Act
            const res = await authHandler(createEvent(method));

            // Assert
            expect(res.statusCode).toBe(405);
            expect(JSON.parse(res.body as string).message).toBe("Method Not Allowed");
        }
    });
});

describe("postAuthHandler", () => {
    // Arrange
    const createEvent = (body?: string): APIGatewayProxyEventV2 => ({
        requestContext: { http: { method: "POST", path: "/auth" } } as any,
        body,
    } as any);

    beforeEach(() => {
        jest.resetAllMocks();
    });

    test("should return 400 when body is missing", async () => {
        // Act
        const res = await postAuthHandler(createEvent());
        // Assert
        expect(res.statusCode).toBe(400);
        expect(res.body).toBe(JSON.stringify({
            message: "Request body is missing"
        }));
    });

    test("should return 401 on login failure", async () => {
        // Arrange
        jest.spyOn(AuthService.prototype, "login").mockRejectedValue(new InvalidCredentialsException());
        const event = createEvent(JSON.stringify({ userId: "u", userPwd: "p" }));
        // Act
        const res = await postAuthHandler(event);
        // Assert
        expect(res.statusCode).toBe(401);
        expect(res.body).toBe(JSON.stringify({
            message: "Invalid credentials"
        }));
    });

    test("should return 200 and token JSON on login success", async () => {
        // Arrange
        const fakeAuth = new Auth({
            accessToken: "at",
            refreshToken: "rt",
            type: "Bearer",
            expiredAt: 9999,
        });
        jest.spyOn(AuthService.prototype, "login").mockResolvedValue(fakeAuth);
        const event = createEvent(JSON.stringify({ userId: "u", userPwd: "p" }));
        // Act
        const res = await postAuthHandler(event);
        // Assert
        expect(res.statusCode).toBe(200);
        expect(res.headers?.["Content-Type"]).toBe("application/json");
        expect(res.body).toBe(JSON.stringify(fakeAuth));
    });

    test("should return 500 on unexpected error", async () => {
        // Arrange
        jest.spyOn(AuthService.prototype, "login").mockImplementation(() => { throw new Error("oops"); });
        const event = createEvent(JSON.stringify({ userId: "u", userPwd: "p" }));
        // Act
        const res = await postAuthHandler(event);
        // Assert
        expect(res.statusCode).toBe(500);
        expect(res.body).toBe(JSON.stringify({
            message: "Internal server error",
            error: "oops"
        }));
    });
});
