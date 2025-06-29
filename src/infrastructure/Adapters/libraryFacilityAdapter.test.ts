import { LibraryFacilityAdapter } from './libraryFacilityAdapter';
import { Auth, AuthenticationFailedException } from '../../domain/auth/auth';
import { FacilityInfoResponse, GetRoomData, FacilityResponse, UserInfoResponse, NormalRoomGroupDate, RoomOther, RoomReservation } from './dto/facility.dto';
import { YYYYMMDD } from '../../common/types/common.interface';
import { allFacilityInfo } from '../../domain/facility/facilityService';
import { FacilityGroup, FacilityInfo, CommonFacilityInfo } from '../../domain/facility/facility';

// 원래 fetch 함수를 저장
const originalFetch = global.fetch;

describe('LibraryFacilityAdapter', () => {
    let libraryFacilityAdapter: LibraryFacilityAdapter;
    let accessToken: string;

    beforeEach(() => {
        libraryFacilityAdapter = new LibraryFacilityAdapter();
        accessToken = 'test-token';
        // 환경 변수 설정
        process.env.GIST_LIBRARY_URL = 'https://library.gist.ac.kr';
        process.env.GIST_LIBRARY_PORT = '8443';
        global.fetch = jest.fn();
    });

    afterEach(() => {
        // 테스트 후 fetch 복원
        global.fetch = originalFetch;
        // 환경 변수 초기화
        delete process.env.GIST_LIBRARY_URL;
        delete process.env.GIST_LIBRARY_PORT;
        jest.clearAllMocks();
    });

    describe('getAllFacilityInfo', () => {
        const mockDate: YYYYMMDD = '20250507';

        const mockFacilityResponse: FacilityResponse[] = [
            { FAC_NM: "Group Study Room 1", FLOOR: 2, ROOM_ID: 202, ROOM_GROUP: 3, ROOM_NO: 202 },
            { FAC_NM: "Group Study Room 2", FLOOR: 2, ROOM_ID: 203, ROOM_GROUP: 3, ROOM_NO: 203 },
            { FAC_NM: "Small Carrel 1", FLOOR: 2, ROOM_ID: 219, ROOM_GROUP: 5, ROOM_NO: 219 },
            { FAC_NM: "Unreservable Room", FLOOR: 1, ROOM_ID: 108, ROOM_GROUP: -1, ROOM_NO: 108 }, // 예약 불가 시설
        ];

        const mockUserInfoResponse: UserInfoResponse = {
            DEPARTMENT_NM: "Test Department",
            FAC_DUR1: 0,
            MONTH: 5,
            USER_NM: "Test User",
            KOREAN_NM: "학부생",
            USER_ID: "testuser",
            FAC_DUR4: 4, // 일별 예약 가능 횟수
            FAC_DUR5: 80, // 월별 예약 가능 횟수
            FAC_DUR2: 0,
            FAC_DUR3: 0,
            DATE_END: "2025-05-31",
            DATE_START: "2025-05-01",
        };

        const mockFacilityData = {
            notAvailableRoomDays: [],
            infoCount: 5, // 월별 예약 횟수
            facility: mockFacilityResponse,
            info: mockUserInfoResponse,
        };

        const mockFacilityInfoResponse: FacilityInfoResponse = {
            status: 200,
            message: 'OK',
            data: mockFacilityData,
            timestamp: '',
            path: ''
        };

        const mockRoomGroupDate202: NormalRoomGroupDate = {
            FAC_NM: "2F, Group Study Rooms(for 8 people), Room 202-204",
            FLOOR: 2, USE_YN: null, ROOM_ID: 202, ROOM_GROUP: 3, FROM_TIME: 8, id: 3,
            GROUP_NM: "2F, Group Study Rooms(for 8 people), Room 202-204",
            UPDATE_ID: "admin", UPDATE_DT: "2016-06-02T12:15:53.000+00:00", TO_TIME: 23, ROOM_NO: 202,
        };
        const mockRoomGroupDate203: NormalRoomGroupDate = {
            FAC_NM: "2F, Group Study Rooms(for 8 people), Room 202-204",
            FLOOR: 2, USE_YN: null, ROOM_ID: 203, ROOM_GROUP: 3, FROM_TIME: 8, id: 3,
            GROUP_NM: "2F, Group Study Rooms(for 8 people), Room 202-204",
            UPDATE_ID: "admin", UPDATE_DT: "2016-06-02T12:15:53.000+00:00", TO_TIME: 23, ROOM_NO: 203,
        };
        const mockRoomGroupDate219: NormalRoomGroupDate = {
            FAC_NM: "2F, Small-sized Carrels, Rooms 219-236",
            FLOOR: 2, USE_YN: null, ROOM_ID: 219, ROOM_GROUP: 5, FROM_TIME: 9, id: 5,
            GROUP_NM: "2F, Small-sized Carrels, Rooms 219-236",
            UPDATE_ID: "admin", UPDATE_DT: "2016-06-02T12:15:53.000+00:00", TO_TIME: 22, ROOM_NO: 219,
        };


        const mockGetRoomData202: GetRoomData = {
            normalRoomGroupDates: [mockRoomGroupDate202],
            infoCountDay: 2, canAvailableRoomDates: [],
            roomOther: [{ GROUP_NM: "타인", DEPT_NM: "타과", REMARK: "타과", RES_HOUR: 10 }],
            notAvailableRoomDates: [], infoCount: 3,
            room: [{ RES_ID: 1, RES_HOUR: 14 }],
        };

        const mockGetRoomData203: GetRoomData = {
            normalRoomGroupDates: [mockRoomGroupDate203],
            infoCountDay: 2, canAvailableRoomDates: [],
            roomOther: [],
            notAvailableRoomDates: [], infoCount: 3,
            room: [],
        };
        const mockGetRoomData219: GetRoomData = {
            normalRoomGroupDates: [mockRoomGroupDate219],
            infoCountDay: 2, canAvailableRoomDates: [],
            roomOther: [{ GROUP_NM: "타인2", DEPT_NM: "타과2", REMARK: "타과2", RES_HOUR: 11 }],
            notAvailableRoomDates: [], infoCount: 3,
            room: [{ RES_ID: 2, RES_HOUR: 15 }],
        };


        it('성공적으로 모든 시설 정보를 가져와야 함', async () => {
            // Arrange
            (global.fetch as jest.Mock)
                .mockResolvedValueOnce({ // getFacilityInfo 응답
                    ok: true,
                    json: async () => mockFacilityInfoResponse,
                })
                .mockResolvedValueOnce({ // getRoom for 202 응답
                    ok: true,
                    json: async () => ({ data: mockGetRoomData202 }),
                })
                .mockResolvedValueOnce({ // getRoom for 203 응답
                    ok: true,
                    json: async () => ({ data: mockGetRoomData203 }),
                })
                .mockResolvedValueOnce({ // getRoom for 219 응답
                    ok: true,
                    json: async () => ({ data: mockGetRoomData219 }),
                });


            // Act
            const result: allFacilityInfo = await libraryFacilityAdapter.getAllFacilityInfo(accessToken, mockDate);

            // Assert
            expect(global.fetch).toHaveBeenCalledTimes(4); // getFacilityInfo 1번, getRoom 3번 (예약 가능 시설 수만큼)
            expect(global.fetch).toHaveBeenNthCalledWith(1,
                'https://library.gist.ac.kr:8443/work/getFacilityInfo',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer test-token',
                    },
                })
            );
            expect(global.fetch).toHaveBeenNthCalledWith(2,
                'https://library.gist.ac.kr:8443/work/getRoom',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ ROOM_ID: 202, RES_YYYYMMDD: mockDate }),
                })
            );
            expect(global.fetch).toHaveBeenNthCalledWith(3,
                'https://library.gist.ac.kr:8443/work/getRoom',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ ROOM_ID: 203, RES_YYYYMMDD: mockDate }),
                })
            );
            expect(global.fetch).toHaveBeenNthCalledWith(4,
                'https://library.gist.ac.kr:8443/work/getRoom',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ ROOM_ID: 219, RES_YYYYMMDD: mockDate }),
                })
            );

            expect(result.facilityGroup).toHaveLength(2); // ROOM_GROUP이 -1인 시설은 제외

            const group3 = result.facilityGroup.find(g => g.id === 3);
            expect(group3).toBeDefined();
            expect(group3?.name).toBe(mockRoomGroupDate202.FAC_NM); // 첫번째 방의 정보로 업데이트됨
            expect(group3?.floor).toBe(2);
            expect(group3?.fromTime).toBe(8);
            expect(group3?.toTime).toBe(23);
            expect(group3?.facilities).toHaveLength(2);

            const facility202 = group3?.facilities.find(f => f.id === 202);
            expect(facility202?.reservationByMe).toEqual([14]);
            expect(facility202?.reservationByOthers).toEqual([10]);

            const facility203 = group3?.facilities.find(f => f.id === 203);
            expect(facility203?.reservationByMe).toEqual([]);
            expect(facility203?.reservationByOthers).toEqual([]);


            const group5 = result.facilityGroup.find(g => g.id === 5);
            expect(group5).toBeDefined();
            expect(group5?.name).toBe(mockRoomGroupDate219.FAC_NM);
            expect(group5?.facilities).toHaveLength(1);
            const facility219 = group5?.facilities.find(f => f.id === 219);
            expect(facility219?.reservationByMe).toEqual([15]);
            expect(facility219?.reservationByOthers).toEqual([11]);


            expect(result.commonFacilityInfo.notAvailableDays).toEqual([]);
            expect(result.commonFacilityInfo.reservationLimitInDay).toBe(mockUserInfoResponse.FAC_DUR4);
            expect(result.commonFacilityInfo.reservationLimitInMonth).toBe(mockUserInfoResponse.FAC_DUR5);
            // mockGetRoomData의 infoCount(Day)는 방에 상관 없이 같아야함
            expect(result.commonFacilityInfo.reservationCountInDay).toBe(mockGetRoomData202.infoCountDay);
            expect(result.commonFacilityInfo.reservationCountInMonth).toBe(mockGetRoomData202.infoCount);
        });

        it('환경 변수 누락 시 에러를 던져야 함', async () => {
            // Arrange
            delete process.env.GIST_LIBRARY_URL;

            // Act & Assert
            await expect(libraryFacilityAdapter.getAllFacilityInfo(accessToken, mockDate))
                .rejects.toThrow('Library API configuration is missing');
        });

        it('getFacilityInfo API 호출 실패 시 에러를 던져야 함', async () => {
            // Arrange
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
            });

            // Act & Assert
            await expect(libraryFacilityAdapter.getAllFacilityInfo(accessToken, mockDate))
                .rejects.toThrow('Failed to fetch facility info: 500 Internal Server Error');
        });

        it('getFacilityInfo API가 빈 데이터를 반환 시 에러를 던져야 함', async () => {
            // Arrange
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => null, // 여전히 null 반환
            });

            // Act & Assert
            await expect(libraryFacilityAdapter.getAllFacilityInfo(accessToken, mockDate))
                .rejects.toThrow('No facility data received');
        });


        it('getRoom API 호출 중 하나가 실패 시 에러를 던져야 함', async () => {
            // Arrange
            (global.fetch as jest.Mock).mockImplementation(async (url: string, options: RequestInit) => {
                const urlString = url.toString();
                if (urlString.endsWith('/getFacilityInfo')) {
                    return {
                        ok: true,
                        json: async () => mockFacilityInfoResponse,
                    };
                }
                if (urlString.endsWith('/getRoom')) {
                    const body = JSON.parse(options.body as string);
                    if (body.ROOM_ID === 202) {
                        return { ok: true, json: async () => ({ data: mockGetRoomData202 }) };
                    }
                    if (body.ROOM_ID === 203) {
                        return { ok: false, status: 500, statusText: 'Room Error' };
                    }
                    if (body.ROOM_ID === 219) {
                        return { ok: true, json: async () => ({ data: mockGetRoomData219 }) };
                    }
                }
                return { ok: false, status: 404, statusText: 'Not Found' };
            });

            // Act & Assert
            await expect(libraryFacilityAdapter.getAllFacilityInfo(accessToken, mockDate))
                .rejects.toThrow('Failed to fetch room details for facility 203');
        });

        it('getRoom API가 빈 normalRoomGroupDates를 반환 시 에러를 던져야 함', async () => {
            // Arrange
            const emptyRoomGroupData: GetRoomData = {
                ...mockGetRoomData202,
                normalRoomGroupDates: [], // Empty data
            };
            (global.fetch as jest.Mock)
                .mockResolvedValueOnce({ ok: true, json: async () => mockFacilityInfoResponse }) // For getFacilityInfo
                .mockResolvedValueOnce({ ok: true, json: async () => ({ data: emptyRoomGroupData }) })      // For getRoom (facility 202) - causes the intended error
                .mockResolvedValueOnce({ ok: true, json: async () => ({ data: mockGetRoomData203 }) })      // For getRoom (facility 203) - needs to succeed
                .mockResolvedValueOnce({ ok: true, json: async () => ({ data: mockGetRoomData219 }) });     // For getRoom (facility 219) - needs to succeed


            // Act & Assert
            // getAllFacilityInfo는 내부적으로 Promise.all을 사용하여 여러 방 정보를 가져온 후, 각 방의 데이터를 처리합니다.
            // facility 202에 대한 데이터를 처리할 때 normalRoomGroupDates가 비어 있으므로 오류가 발생해야 합니다.
            await expect(libraryFacilityAdapter.getAllFacilityInfo(accessToken, mockDate))
                .rejects.toThrow('No room group data found for facility 202');
        });

        it('시설 데이터가 비어있는 경우 정상적으로 빈 facilityGroup을 반환해야 함', async () => {
            // Arrange
            const emptyFacilityData: FacilityInfoResponse["data"] = {
                ...mockFacilityData,
                facility: [], // No facilities
            };
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: emptyFacilityData }),
            });

            // Act
            const result = await libraryFacilityAdapter.getAllFacilityInfo(accessToken, mockDate);

            // Assert
            expect(result.facilityGroup).toEqual([]);
            expect(result.commonFacilityInfo).toBeDefined();
            expect(global.fetch).toHaveBeenCalledTimes(1); // getFacilityInfo만 호출
        });

        it('모든 시설이 예약 불가 (ROOM_GROUP = -1)인 경우 빈 facilityGroup을 반환해야 함', async () => {
            // Arrange
            const allUnreservableFacility: FacilityResponse[] = mockFacilityResponse.map(f => ({ ...f, ROOM_GROUP: -1 }));
            const unreservableFacilityData: FacilityInfoResponse["data"] = {
                ...mockFacilityData,
                facility: allUnreservableFacility,
            };
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: unreservableFacilityData }),
            });

            // Act
            const result = await libraryFacilityAdapter.getAllFacilityInfo(accessToken, mockDate);

            // Assert
            expect(result.facilityGroup).toEqual([]);
            expect(result.commonFacilityInfo).toBeDefined();
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });


        it('getRoom API 응답에서 roomOther 또는 room이 빈 배열일 경우 정상 처리해야 함', async () => {
            // Arrange
            const noReservationsRoomData: GetRoomData = {
                ...mockGetRoomData202,
                roomOther: [],
                room: [],
            };
            (global.fetch as jest.Mock)
                .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { ...mockFacilityData, facility: [mockFacilityResponse[0]] } })}) // facility 202만 사용
                .mockResolvedValueOnce({ ok: true, json: async () => ({ data: noReservationsRoomData }) });

            // Act
            const result = await libraryFacilityAdapter.getAllFacilityInfo(accessToken, mockDate);

            // Assert
            const group3 = result.facilityGroup.find(g => g.id === 3);
            const facility202 = group3?.facilities.find(f => f.id === 202);
            expect(facility202?.reservationByMe).toEqual([]);
            expect(facility202?.reservationByOthers).toEqual([]);
        });
    });
});
