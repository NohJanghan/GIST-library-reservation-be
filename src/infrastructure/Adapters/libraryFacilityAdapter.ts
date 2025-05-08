import { FacilityRepository } from '../../domain/facility/facilityRepository.interface';
import { allFacilityInfo } from '../../domain/facility/facilityService';
import { FacilityGroup, FacilityInfo, CommonFacilityInfo} from '../../domain/facility/facility';
import { YYYYMMDD } from '../../common/types/common.interface';
import { FacilityInfoResponse, GetRoomData, GetRoomResponse } from './dto/facility.dto';

export class LibraryFacilityAdapter implements FacilityRepository {
    // API 경로 정의
    private readonly FACILITY_INFO_PATH = '/work/getFacilityInfo';
    private readonly ROOM_INFO_PATH = '/work/getRoom';

    /**
     * 모든 시설 정보와 예약 상태를 조회합니다.
     */
    async getAllFacilityInfo(token: string, date: YYYYMMDD): Promise<allFacilityInfo> {
        try {
            // 1. 인증 헤더 설정
            const authHeader = this.createAuthHeader(token);

            // 2. 기본 시설 정보 조회
            const facilityData = await this.fetchFacilityInfo(authHeader);

            // 3. 시설 정보 처리
            const { facilityGroups, commonInfo } = this.processFacilityInfo(facilityData.data);

            // 4. 각 시설별 예약 정보 조회 및 처리
            await this.fetchAndProcessRoomDetails(facilityGroups, commonInfo, authHeader, date);

            // 5. 결과 반환
            return {
                facilityGroup: Array.from(facilityGroups.values()),
                commonFacilityInfo: commonInfo
            };
        } catch (error) {
            console.error('Error fetching facility information:', error);
            throw error;
        }
    }

    /**
     * 인증 토큰으로부터 인증 헤더를 생성합니다.
     */
    private createAuthHeader(token: string): string {
        return `Bearer ${token}`;
    }

    /**
     * API URL을 생성합니다.
     */
    private createApiUrl(path: string): string {
        if (!process.env.GIST_LIBRARY_URL || !process.env.GIST_LIBRARY_PORT) {
            throw new Error('Library API configuration is missing');
        }
        return `${process.env.GIST_LIBRARY_URL}:${process.env.GIST_LIBRARY_PORT}${path}`;
    }

    /**
     * 기본 시설 정보를 조회합니다.
     */
    private async fetchFacilityInfo(authHeader: string): Promise<FacilityInfoResponse> {
        const response = await fetch(this.createApiUrl(this.FACILITY_INFO_PATH), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            },
            body: JSON.stringify({})
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch facility info: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (!data) {
            throw new Error('No facility data received');
        }

        return data;
    }

    /**
     * 시설 정보를 처리하여 그룹과 공통 정보를 생성합니다.
     */
    private processFacilityInfo(data: FacilityInfoResponse["data"]): {
        facilityGroups: Map<number, FacilityGroup>,
        commonInfo: CommonFacilityInfo
    } {
        const facilityGroups: Map<number, FacilityGroup> = new Map();

        if (!data) {
            throw new Error('No facility data to process');
        }

        // 시설 정보 처리
        const facilities = data.facility;
        facilities.forEach(facility => {
            if (facility.ROOM_GROUP === -1) {
                return;
            }

            // 시설 정보 생성
            const facilityInfo = new FacilityInfo(
                facility.ROOM_ID,
                facility.ROOM_GROUP,
                [],
                []
            );

            // 시설 그룹 처리
            if (facilityGroups.has(facility.ROOM_GROUP)) {
                const group = facilityGroups.get(facility.ROOM_GROUP);
                if (group) {
                    group.facilities.push(facilityInfo);
                }
            } else {
                const newGroup = new FacilityGroup(
                    facility.ROOM_GROUP,
                    facility.FAC_NM,
                    facility.FLOOR,
                    [], 0, 0 // FROM, TO TIME은 상세 조회 후 채워넣음
                );
                newGroup.facilities.push(facilityInfo);
                facilityGroups.set(facility.ROOM_GROUP, newGroup);
            }
        });

        // 공통 정보 생성
        const commonInfo: CommonFacilityInfo = {
            notAvailableDays: data.notAvailableRoomDays,
            reservationLimitInDay: data.info.FAC_DUR4, // 일별 예약 가능 횟수
            reservationLimitInMonth: data.info.FAC_DUR5, // 월별 예약 가능 횟수
            reservationCountInDay: data.info.FAC_DUR4, // 일별 예약 횟수(임시값, 즉 예약 불가)
            reservationCountInMonth: data.infoCount // 월별 예약 횟수
        };

        return { facilityGroups, commonInfo };
    }

    /**
     * 각 시설별 예약 정보를 조회하고 처리합니다.
     */
    private async fetchAndProcessRoomDetails(
        facilityGroups: Map<number, FacilityGroup>,
        commonInfo: CommonFacilityInfo,
        authHeader: string,
        date: YYYYMMDD
    ): Promise<void> {
        // 모든 시설에 대한 API 요청 생성
        const roomRequests = Array.from(facilityGroups.values())
            .flatMap(group => group.facilities.map(facility => ({
                facility,
                groupId: group.id,
                request: this.fetchRoomInfo(facility.id, date, authHeader)
            })));

        // 병렬로 모든 요청 실행
        const roomDetailsPromises = roomRequests.map(async ({ facility, groupId, request }) => {
            try {
                const response = await request;
                return { facility, groupId, response };
            } catch (error) {
                throw new Error(`Failed to fetch room details for facility ${facility.id}`);
            }
        });

        // 모든 결과 처리
        const roomDetails = await Promise.all(roomDetailsPromises);

        // 결과 데이터로 시설 및 그룹 정보 업데이트
        roomDetails.forEach(({ facility, groupId, response }) => {
            const group = facilityGroups.get(groupId);
            if (!group) {
                throw new Error(`Group not found for facility ${facility.id}`);
            }
            const data = response.data;
            if (!data) {
                console.error('Response:', response);
                throw new Error(`No data found for facility ${facility.id}`);
            }

            this.updateFacilityWithRoomDetails(facility, group, data);
        });

        // 공통 정보 업데이트
        if (roomDetails.length > 0 && roomDetails[0].response.data) {
            commonInfo.reservationCountInDay = roomDetails[0].response.data.infoCountDay
            commonInfo.reservationCountInMonth = roomDetails[0].response.data.infoCount;
        } else {
            commonInfo.reservationCountInDay = 0;
            commonInfo.reservationCountInMonth = 0;
        }
    }

    /**
     * 특정 방의 예약 정보를 조회합니다.
     */
    private async fetchRoomInfo(roomId: number, date: YYYYMMDD, authHeader: string): Promise<GetRoomResponse> {
        const response = await fetch(this.createApiUrl(this.ROOM_INFO_PATH), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            },
            body: JSON.stringify({
                ROOM_ID: roomId,
                RES_YYYYMMDD: date
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch room info for room ${roomId}: ${response.status}`);
        }

        return response.json();
    }

    /**
     * 방 상세 정보로 시설 정보를 업데이트합니다.
     */
    private updateFacilityWithRoomDetails(
        facility: FacilityInfo,
        group: FacilityGroup,
        data: GetRoomData
    ): void {
        if(!data?.normalRoomGroupDates) {
            throw new Error(`No normal room group dates found for facility ${facility.id}`);
        }
        const roomGroupData = data.normalRoomGroupDates[0];
        if (!roomGroupData) {
            throw new Error(`No room group data found for facility ${facility.id}`);
        }

        // 그룹 정보 업데이트
        group.name = roomGroupData.FAC_NM;
        group.floor = roomGroupData.FLOOR;
        group.fromTime = roomGroupData.FROM_TIME;
        group.toTime = roomGroupData.TO_TIME;

        // 시설 예약 정보 업데이트
        facility.reservationByOthers = data.roomOther.map(room => room.RES_HOUR);
        facility.reservationByMe = data.room.map(room => room.RES_HOUR);
    }
}