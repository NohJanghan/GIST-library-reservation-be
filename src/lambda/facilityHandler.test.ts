// mGetAllInfo 함수 목업 정의 및 FacilityService 모듈 전체 목업
const mGetAllInfo = jest.fn();
jest.mock("../domain/facility/facilityService", () => ({
    FacilityService: jest.fn().mockImplementation(() => ({
        getAllInfo: mGetAllInfo,
    })),
}));

import { facilityHandler } from "./facilityHandler";
import type { allFacilityInfo } from "../domain/facility/facilityService";
import type { APIGatewayProxyEventQueryStringParameters, APIGatewayProxyEventV2 } from "aws-lambda";

describe("facilityHandler", () => {
    const commonHeaders = { "Content-Type": "application/json" };
    const createEvent = (
        method: string,
        token?: string,
        queryStringParameters?: APIGatewayProxyEventQueryStringParameters
    ): APIGatewayProxyEventV2 => ({
        requestContext: { http: { method, path: "/facility" } } as any,
        headers: token ? { Authorization: token } : {},
        queryStringParameters: queryStringParameters,
    } as any);

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("should return 200 and JSON data on valid GET request", async () => {
        const sampleDate = "20250808";
        const sampleData: allFacilityInfo = {
            facilityGroup: [
                {
                    id: 1,
                    name: "Group1",
                    floor: 2,
                    facilities: [
                        { id: 101, GroupId: 1, reservationByOthers: [12], reservationByMe: [14] }
                    ],
                    fromTime: 8,
                    toTime: 18
                }
            ],
            commonFacilityInfo: {
                notAvailableDays: [],
                reservationCountInDay: 1,
                reservationCountInMonth: 2,
                reservationLimitInDay: 3,
                reservationLimitInMonth: 5
            }
        };
        mGetAllInfo.mockResolvedValue(sampleData);

        const event = createEvent("GET", "Bearer test-token", { date: sampleDate });
        const res = await facilityHandler(event);

        expect(res.statusCode).toBe(200);
        expect(res.headers).toEqual(commonHeaders);
        expect(res.body).toBe(JSON.stringify(sampleData));
        expect(mGetAllInfo).toHaveBeenCalledWith("test-token", sampleDate);
    });

    it("should return 405 for unsupported methods", async () => {
        const methods = ["POST", "PUT", "DELETE"];
        for (const method of methods) {
            const event = createEvent(method, "Bearer test-token");
            const res = await facilityHandler(event);

            expect(res.statusCode).toBe(405);
            expect(JSON.parse(res.body as string).message)
                .toBe("Method Not Allowed");
        }
    });

    it("should return 400 if Authorization header is missing or invalid", async () => {
        const event = createEvent("GET", undefined, { date: "20250808" });
        const res = await facilityHandler(event);

        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.body as string).message)
            .toBe("Missing or invalid token");
    });

    it("should return 400 if date parameter is missing", async () => {
        const event = createEvent("GET", "Bearer test-token"); // 날짜 파라미터 없음
        const res = await facilityHandler(event);

        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.body as string).message)
            .toBe("Missing date parameter");
    });

    it("should return 500 on unexpected service error", async () => {
        mGetAllInfo.mockRejectedValue(new Error("service-failed"));
        const event = createEvent("GET", "Bearer test-token", { date: "20250808" });
        const res = await facilityHandler(event);

        expect(res.statusCode).toBe(500);
        const body = JSON.parse(res.body as string);
        expect(body.message).toBe("Internal server error");
        expect(body.error).toBe("service-failed");
    });
});
