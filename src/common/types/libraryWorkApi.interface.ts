import type { DateDash, DateTimeDash, YYYYMMDD } from "./common.interface";

//**********getMyReservation********** */ */
/**
 * 시설(방) 정보 조회 요청 데이터
 */
export interface MyReservationRequest {
  START_DT: YYYYMMDD; // 조회 시작일 (YYYYMMDD 형식, 예: "20250427")
  END_DT: YYYYMMDD;   // 조회 종료일 (YYYYMMDD 형식, 예: "20250526")
  ROOM_ID: number;  // 조회할 방의 고유 식별자 (예: 108)
}

/**
 * 예약 정보
 */
export interface Reservation {
  CREATE_DT: string;      // 예약 생성 일시 (ISO 8601 형식, 예: "2025-04-27T05:52:38.857+00:00")
  CANCEL_RESID: any;      // unknown
  RES_YYYYMMDD: YYYYMMDD;   // 예약 날짜 (YYYYMMDD 형식, 예: "20250501")
  ROOM_ID: number;        // 예약된 방의 고유 식별자 (예: 219)
  ADMIN_YN: "Y" | "N"; // 관리자 등록 여부 ("Y": 관리자, "N": 일반 사용자)
  USER_ID: string;        // 예약자 ID (예: "20235123")
  CANCEL_YN: "Y" | "N"; // 예약 취소 여부 ("Y": 취소됨, "N": 정상 예약)
  RES_ID: number;         // 예약 고유 ID (예: 673314)
  id: number;             // 예약 고유 ID (RES_ID와 동일, 시스템상 중복 필드)
  CREATE_ID: string;      // 예약 생성자 ID (예: "20235123", 일반적으로 USER_ID와 동일)
  REMARK: string;         // 예약 메모 (예: 학과명 등)
  RES_HOUR: number;       // 예약 시간(시작 시간) (24시간제, 예: 14는 오후 2시)
}

/**
 * 내 예약 정보 조회 API 응답
 */
export interface MyReservationResponse {
  status: number;              // HTTP 상태 코드 (예: 200)
  message: string;             // 응답 메시지 (예: "OK")
  data: Reservation[] | null;  // 예약 정보 리스트
  timestamp: DateTimeDash;           // 응답 생성 시각 (예: "2025-04-27 15:00:42")
  path: string;                // 요청된 API 엔드포인트 경로 (예: "/work/getMyReservation")
}

//**********getFacilityInfo********** */ */
/**
 * 시설(방) 정보
 */
export interface Facility {
  FAC_NM: string;   // 시설(방) 이름 및 설명 (예: "2F, Group Study Rooms(for 8 people), Room 202-204 (202)")
  FLOOR: number;    // 해당 시설이 위치한 층 (예: 2)
  ROOM_ID: number;  // 방의 고유 식별자 (예: 202)
  ROOM_GROUP: number; // 방 그룹 번호 (같은 공간을 묶어서 관리할 때 사용, 예약할 권한이 없다면 -1)
  ROOM_NO: number;  // 방 번호 (예: 202)
}

/**
 * 사용자 및 예약 관련 정보
 */
export interface Info {
  DEPARTMENT_NM: string; // 소속 학과명 (예: "전기전자컴퓨터공학과")
  FAC_DUR1: number;      // unknown
  MONTH: number;         // 기준 월 (예: 4월 -> 4)
  USER_NM: string;       // 예약 사용자 이름 (예: "홍길동")
  KOREAN_NM: string;     // 사용자 구분 (예: "학부생")
  USER_ID: string;       // 사용자 고유 ID (예: "20235123")
  DATE_START: DateDash;    // 예약 시작일 (YYYY-MM-DD 형식, 예: "2025-04-27")
  FAC_DUR4: number;      // 일별 예약 가능시간
  FAC_DUR5: number;      // 월별 예약 가능시간
  FAC_DUR2: number;      // unknown
  DATE_END: DateDash;      // 예약 종료일 (YYYY-MM-DD 형식, 예: "2025-05-26")
  FAC_DUR3: number;      // unknown
}

//**********getFacilityReservation********** */ */
/**
 * 시설 예약 날짜 조회 API 응답
 */
export interface FacilityInfoResponse {
  status: number; // HTTP 상태 코드 (예: 200)
  message: string; // 응답 메시지 (예: "OK")
  data: {
    notAvailableRoomDays: any[];  // unknown
    infoCount: number; //unknown
    facility: Facility[]; // 시설(방) 목록
    info: Info; // 사용자 및 예약 관련 정보
  } | null;
  timestamp: DateTimeDash; // 응답 생성 시각 (예: "2025-04-27 15:00:42")
  path: string; // 요청된 API 엔드포인트 경로 ("/work/getFacilityInfo")
}

/**
 * 시설 예약 날짜 조회 요청 데이터
 */
export interface FacilityReservationRequest {
  START_DT: YYYYMMDD; // 조회 시작일 (YYYYMMDD 형식, 예: "20250401")
  END_DT: YYYYMMDD;   // 조회 종료일 (YYYYMMDD 형식, 예: "20250430")
  ROOM_ID: number;  // 조회할 방의 고유 식별자 (예: 228)
}

/**
 * 시설 예약 날짜 정보
 */
export interface FacilityReservationItem {
  RES_YYYYMMDD: YYYYMMDD; // 예약 날짜 (YYYYMMDD 형식, 예: "20250430")
}

/**
 * 시설 예약 결과 데이터
 */
export interface FacilityReservationResultData {
  result: FacilityReservationItem[]; // 예약 날짜 배열
}

//**********getRoom********** */ */
/**
 * 시설 예약 정보 조회 API 응답
 */
export interface FacilityReservationResponse {
  status: number;    // HTTP 상태 코드 (예: 200, 501)
  message: string;   // 응답 메시지 (예: "OK", 에러 메시지)
  data: FacilityReservationResultData | null; // 예약 결과 데이터 또는 null
  timestamp: DateTimeDash; // 응답 생성 시각 (예: "2025-04-27 22:31:04")
  path: string;      // 요청된 API 엔드포인트 경로 (예: "/work/getFacilityReservation")
}

/**
 * 방 상세 정보 및 예약 현황 조회 요청 데이터
 */
export interface GetRoomRequest {
  START_DT_YYYYMMDD?: YYYYMMDD; // 조회 시작일 (YYYYMMDD 형식, 필요 없음)
  END_DT_YYYYMMDD?: YYYYMMDD;   // 조회 종료일 (YYYYMMDD 형식, 필요 없음)
  ROOM_ID: number;           // 조회할 방의 고유 식별자 (예: 228)
  RES_YYYYMMDD: YYYYMMDD;      // 특정 예약 일자 (YYYYMMDD 형식, 예: "20250430")
}

/**
 * 방 상세 정보 및 예약 현황 조회 API 응답
*/
export interface GetRoomResponse {
    status: number; // HTTP 상태 코드 (예: 200, 501)
    message: string; // 응답 메시지 (예: "OK", 오류 메시지 등)
    data: GetRoomData | null; // 결과 데이터 (에러 시 null)
    timestamp: DateTimeDash; // 응답 생성 시각 (예: "2025-04-27 22:30:37")
    path: string; // 요청된 API 엔드포인트 경로 (예: "/work/getRoom")
}

/**
 * 방 상세 정보 및 예약 현황 데이터
 */
export interface GetRoomData {
  normalRoomGroupDates: NormalRoomGroupDate[]; // 방 그룹 정보 리스트
  infoCountDay: number; // 해당 일자의 예약 개수
  canAvailableRoomDates: any[]; // 예약 가능 날짜 리스트 (unknown)
  roomOther: RoomOther[]; // 타인 예약 정보 리스트
  notAvailableRoomDates: any[]; // 예약 불가 날짜 리스트 (unknown)
  infoCount: number; // 해당 달의 예약 개수
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


//**********makeFacilityReservation********** */ */
/**
 * 시설(방) 예약 생성 요청 데이터
 */
export interface MakeFacilityReservationRequest {
  ROOM_ID: number;          // 예약할 방의 고유 식별자 (예: 221)
  CREATE_ID: string;        // 예약 생성자 ID (예: "20235123")
  REMARK: string;           // 비고/학과 등 (예: "전기전자컴퓨터공학과")
  RES_YYYYMMDD: YYYYMMDD;     // 예약 날짜 (YYYYMMDD 형식, 예: "20250429")
  RES_HOUR: number;         // 예약 시간(시작 시간, 24시간제, 예: 14)
  ADMIN_YN: "Y" | "N";  // 관리자 예약 여부 ("Y": 관리자, "N": 일반)
}

/**
 * 예약 실패 시 상세 에러 데이터
 */
export interface MakeFacilityReservationErrorData {
  Details: string | null;
  Class: string | null;
  Method: string | null;
}

/**
 * 시설(방) 예약 생성 API 응답
 */
export interface MakeFacilityReservationResponse {
  status: number; // HTTP 상태 코드 (예: 200, 501)
  message: string; // 응답 메시지 (예: "OK", "error", 예외 메시지 등)
  data: number | MakeFacilityReservationErrorData | null; // 결과 데이터 (성공 시 2)
  timestamp: DateTimeDash; // 응답 생성 시각 (예: "2025-04-27 23:07:18")
  path: string; // 요청된 API 엔드포인트 경로 (예: "/work/makeFacilityreservation")
}

//**********cancelFacilityReservation********** */ */
/**
 * 시설(방) 예약 취소 요청 데이터
 */
export interface CancelFacilityReservationRequest {
  ROOM_ID: number;        // 예약 취소할 방의 고유 식별자 (예: 227)
  RES_YYYYMMDD: YYYYMMDD;   // 예약 날짜 (YYYYMMDD 형식, 예: "20250429")
  RES_HOUR: number;       // 예약 시간(24시간제, 예: 14)
  RES_ID: number;         // 예약 고유 ID (예: 673434) ID와 시간이 맞아야함
}

/**
 * 시설(방) 예약 취소 API 응답
 */
export interface CancelFacilityReservationResponse {
  status: number;   // HTTP 상태 코드 (항상 200으로 보임)
  message: string;  // 응답 메시지 (예: "OK")
  data: 1 | 0;     // 처리 결과 (1: 성공, 0: 실패)
  timestamp: DateTimeDash; // 응답 생성 시각 (예: "2025-04-27 23:26:46")
  path: string;     // 요청된 API 엔드포인트 경로 (예: "/work/cancelFacilityreservation")
}
