export interface FacilityInfoResponse {
  status: number; // HTTP 상태 코드 (예: 200)
  message: string; // 응답 메시지 (예: "OK")
  data: {
    notAvailableRoomDays: any[];  // unknown
    infoCount: number; //unknown
    facility: FacilityResponse[]; // 시설(방) 목록
    info: UserInfoResponse; // 사용자 및 예약 관련 정보
  }| null;
  timestamp: string; // 응답 생성 시각 (예: "2025-04-27 15:00:42")
  path: string; // 요청된 API 엔드포인트 경로 ("/work/getFacilityInfo")
}

export interface FacilityResponse {
    FAC_NM: string;   // 시설(방) 이름 및 설명 (예: "2F, Group Study Rooms(for 8 people), Room 202-204 (202)")
    FLOOR: number;    // 해당 시설이 위치한 층 (예: 2)
    ROOM_ID: number;  // 방의 고유 식별자 (예: 202)
    ROOM_GROUP: number; // 방 그룹 번호 (같은 공간을 묶어서 관리할 때 사용, 예약할 권한이 없다면 -1)
    ROOM_NO: number;  // 방 번호 (예: 202)
}

export interface UserInfoResponse {
    DEPARTMENT_NM: string; // 소속 학과명 (예: "전기전자컴퓨터공학과")
    FAC_DUR1: number;      // unknown
    MONTH: number;         // 기준 월 (예: 4월 -> 4)
    USER_NM: string;       // 예약 사용자 이름 (예: "홍길동")
    KOREAN_NM: string;     // 사용자 구분 (예: "학부생")
    USER_ID: string;       // 사용자 고유 ID (예: "20235123")
    FAC_DUR4: number;      // 일별 예약 가능시간
    FAC_DUR5: number;      // 월별 예약 가능시간
    FAC_DUR2: number;      // unknown
    FAC_DUR3: number;      // unknown
    DATE_END: string;      // unknown
    DATE_START: string;    // unknown
}

/*******GetRoom API DTO********/
/**
 * 방 상세 정보 및 예약 현황 데이터
 */
/**
 * 방 상세 정보 및 예약 현황 조회 API 응답
 */
export interface GetRoomResponse {
  status: number; // HTTP 상태 코드 (예: 200, 501)
  message: string; // 응답 메시지 (예: "OK", 오류 메시지 등)
  data: GetRoomData | null; // 결과 데이터 (에러 시 null)
  timestamp: string; // 응답 생성 시각 (예: "2025-04-27 22:31:03")
  path: string; // 요청된 API 엔드포인트 경로 (예: "/work/getRoom")
}

export interface GetRoomData {
    normalRoomGroupDates: NormalRoomGroupDate[]; // 방 그룹 정보 리스트
    infoCountDay: number; // 해당 일자의 내 예약 개수
    canAvailableRoomDates: any[]; // 예약 가능 날짜 리스트 (unknown)
    roomOther: RoomOther[]; // 타인 예약 정보 리스트
    notAvailableRoomDates: any[]; // 예약 불가 날짜 리스트 (unknown)
    infoCount: number; // 해당 달의 내 예약 개수
    room: RoomReservation[]; // 본인 예약 정보 리스트
  }

  /**
   * 방 그룹 정보
   */
  export interface NormalRoomGroupDate {
    FAC_NM: string;        // 시설명 (예: "2F, Small-sized Carrels, Rooms 219-236")
    FLOOR: number;         // 층수 (예: 2)
    USE_YN: null|any;      // unknown
    ROOM_ID: number;       // 방 고유 식별자
    ROOM_GROUP: number;    // 방 그룹 번호
    FROM_TIME: number;     // 사용 시작 시간 (24시간제, 예: 8)
    id: number;            // 방 고유 ID(ROOM_ID와는 다르지만 방마다 고유)
    GROUP_NM: string;      // 그룹명 (예: "2F, Small-sized Carrels, Rooms 219-236")
    UPDATE_ID: string;     // 최종 수정자 (예: "admin")
    UPDATE_DT: string;     // 최종 수정 일시 (ISO 8601 형식)
    TO_TIME: number;       // 사용 종료 시간 (24시간제, 일반적으로 23)
    ROOM_NO: number;       // 방 번호 (예: 228)
  }

  /**
   * 타인 예약 정보
   */
  export interface RoomOther {
    GROUP_NM: string;   // 사용자 그룹명 (예: "학부생", "대학원생")
    DEPT_NM: string;    // 소속 학과명 (예: "전기전자컴퓨터공학과")
    REMARK: string;     // 메모 (보통 학과명과 동일)
    RES_HOUR: number;   // 예약 시간(시작 시간, 24시간제, 예: 10)
  }

  /**
   * 내 예약 정보
   */
  export interface RoomReservation {
    RES_ID: number;     // 예약 고유 ID
    RES_HOUR: number;   // 예약 시간(시작 시간, 24시간제, 예: 16)
  }