import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import type { LoginRequest } from '../domain/auth/dto.interface'
import { AuthService } from "../domain/auth/authService";
import { LibraryAuthAdapter } from "../infrastructure/Adapters/libraryAuthAdapter";
import { InvalidCredentialsException } from "../domain/auth/auth";

// 공통 헤더 객체 정의
const commonHeaders = {
    "Content-Type": "application/json",
};

const authAdapter = new LibraryAuthAdapter()
const authService = new AuthService(authAdapter)

export const authHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
    console.log(`[${new Date().toISOString()}] Auth request received:`, {
        path: event.requestContext.http.path,
        method: event.requestContext.http.method
    });

    switch (event.requestContext.http.method) {
        case 'POST':
            return postAuthHandler(event)
        // case 'GET':
        //     return getAuthHandler(event)
        default:
            return {
                statusCode: 405,
                headers: commonHeaders,
                body: JSON.stringify({
                    message: "Method Not Allowed"
                })
            }
    }
}

export const postAuthHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
    try {
        // 1. Parse and validate the data
        if(!event.body) {
            return {
                statusCode: 400,
                headers: commonHeaders,
                body: JSON.stringify({
                    message: "Request body is missing"
                })
            }
        }
        const data: LoginRequest = JSON.parse(event.body as string);
        // TODO: Use Zod to verify the data in runtime and return 400 if invalid

        // 2. Call the bussiness logic
        const auth = await authService.login(data.userId, data.userPwd).catch((error) => {
            if(error instanceof InvalidCredentialsException) {
                return null
            }
            else throw error
        })
        if (!auth) {
            return {
                statusCode: 401,
                headers: commonHeaders,
                body: JSON.stringify({
                    message: "Invalid credentials"
                })
            }
        }

        // 3. generate the response
        return {
            statusCode: 200,
            headers: commonHeaders,
            body: JSON.stringify(auth)
        }
    } catch (error) {
        console.error('Error in login:', error)
        // 4. Handle the error

        return {
            statusCode: 500,
            headers: commonHeaders,
            body: JSON.stringify({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error"
            })
        }
    }
}

// 추가: GET 요청 처리를 위한 핸들러
export const getAuthHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
    try {
        // TODO: 토큰 검증 및 사용자 인증 상태 확인 로직 구현

        return {
            statusCode: 200,
            headers: commonHeaders,
            body: JSON.stringify({
                status: 'authenticated'
            })
        }
    } catch (error) {
        console.error('Error in auth verification:', error)

        return {
            statusCode: 500,
            headers: commonHeaders,
            body: JSON.stringify({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error"
            })
        }
    }
}