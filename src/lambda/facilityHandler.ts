import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { FacilityService } from "../domain/facility/facilityService";
import { LibraryFacilityAdapter } from "../infrastructure/Adapters/libraryFacilityAdapter";
import { YYYYMMDD } from "../common/types/common.interface";

const commonHeaders = {
    "Content-Type": "application/json",
};

const facilityAdapter = new LibraryFacilityAdapter();
const facilityService = new FacilityService(facilityAdapter);

export const facilityHandler = async (
    event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> => {
    switch (event.requestContext.http.method) {
        case "GET":
            return getFacilityHandler(event);
        default:
            return {
                statusCode: 405,
                headers: commonHeaders,
                body: JSON.stringify({ message: "Method Not Allowed" }),
            };
    }
};

export const getFacilityHandler = async (
    event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> => {
    try {
        const authHeader =
            event.headers.Authorization || event.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return {
                statusCode: 400,
                headers: commonHeaders,
                body: JSON.stringify({ message: "Missing or invalid token" }),
            };
        }
        const token = authHeader.slice(7);

        // 쿼리 파라미터에서 date 추출
        const date = event.queryStringParameters?.date;

        if (!date) {
            return {
                statusCode: 400,
                headers: commonHeaders,
                body: JSON.stringify({ message: "Missing date parameter" }),
            };
        }
        const data = await facilityService.getAllInfo(token, date as YYYYMMDD);

        return {
            statusCode: 200,
            headers: commonHeaders,
            body: JSON.stringify(data),
        };
    } catch (error) {
        console.error("Error in getFacilityHandler:", error);
        return {
            statusCode: 500,
            headers: commonHeaders,
            body: JSON.stringify({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            }),
        };
    }
};