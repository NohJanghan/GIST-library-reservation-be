//**********login********** */ */

/**
 * 사용자 로그인 요청 데이터
 */
export interface LoginRequest {
    userId: string;   // 사용자 ID (예: "20235889")
    userPwd: string;  // 사용자 비밀번호 (예: "rightPassword1!")
}

/**
 * 로그인 API 응답
 */
export interface LoginResponse {
    status: number;               // HTTP 상태 코드 (예: 200, 501)
    message: string;              // 응답 메시지 (예: "OK", 예외 메시지 등)
    data: LoginResponseData | null; // 로그인 결과 데이터 (성공/실패 시 객체, 오류 시 null)
    timestamp: string;            // 응답 생성 시각 (예: "2025-04-28 10:47:40")
    path: string;                 // 요청된 API 경로 (예: "/hello/login")
}

/**
 * 로그인 결과 데이터 (성공, 실패 타입)
 */
type LoginResponseData = LoginSuccessData | LoginFailureData;

/**
 * 로그인 성공 시 데이터
 */
export interface LoginSuccessData {
    success: true;      // 로그인 성공 여부
    accessToken: string; // 간편 토큰 (예: JWT)
    token: TokenInfo;    // 상세 토큰 정보
}

/**
 * 로그인 실패(인증 실패) 시 데이터
 */
export interface LoginFailureData {
    success: false;     // 로그인 성공 여부
}

/**
 * JWT 토큰 및 만료 정보
 */
export interface TokenInfo {
    accessToken: string;  // 엑세스 토큰 (예: JWT)
    refreshToken: string; // 리프레시 토큰
    type: string;         // 토큰 타입 (예: "Bearer")
    expire: number;       // UNIX 타임스탬프(초) 형식의 만료 시각
}

//**********getAccount********** */ */
// It has no request body
/**
 * 계정 정보 조회 응답
 */
export interface GetAccountResponse {
    status: number;                // HTTP 상태 코드 (예: 200, 501)
    message: string;               // 응답 메시지 (예: "OK" 등)
    data: GetAccountData | null;   // 계정 정보 데이터 (정상 시 객체, 오류 시 null)
    timestamp: string;             // 응답 생성 시각
    path: string;                  // 요청된 API 경로
}

/**
 * 계정 정보 응답 데이터
 */
export interface GetAccountData {
    result: AccountInfo;   // 사용자 계정 정보
    AUTHCODE: string;      // 인증 코드
}

/**
 * 사용자 계정 정보
 */
export interface AccountInfo {
    APPROVAL_DT: any;              // 승인 일시 (nullable, any)
    USER_ID: string | null;        // 사용자 ID
    LEAVE_YN: string | null;       // 탈퇴 여부
    GROUP_CD: string | null;       // 그룹 코드
    LEAVE_DT: any;                 // 탈퇴 일시
    APPROVAL_ID: string | null;    // 승인자 ID
    DEL_DT: any;                   // 삭제 일시
    MEMO: string | null;           // 메모
    DEL_FLAG: string | null;       // 삭제 플래그
    EMAIL2: string | null;         // 이메일 2
    FAX_NO2: string | null;        // 팩스번호 2
    UPDATE_DT: string | null;      // 정보 수정 일시
    EMAIL3: string | null;         // 이메일 3
    FAX_NO1: string | null;        // 팩스번호 1
    EMAIL1: string | null;         // 이메일 1
    CPHONE_NO3: string | null;     // 휴대폰번호 3
    GIST_ID: string | null;        // GIST ID
    CPHONE_NO1: string | null;     // 휴대폰번호 1
    CPHONE_NO2: string | null;     // 휴대폰번호 2
    DEPARTMENT_CD_NM: string | null; // 학과명
    USER_NM: string | null;        // 사용자 이름
    USER_PHOTO: string | null;     // 사용자 사진
    LIBRARIAN_YN: string | null;   // 사서 여부
    GRADE: string | null;          // 학년
    POST_NO: string | null;        // 우편번호
    VALID_DT: any;                 // 유효 일시
    REQUEST_DT: any;               // 요청 일시
    TEL_NO: string | null;         // 전화번호
    USER_STATUS: string | null;    // 사용자 상태
    ORG_CD: string | null;         // 조직 코드
    PROXY_YN: string | null;       // 대리 여부
    MANAGEDGRADE_CD: string | null;// 관리 등급 코드
    ADDR2: string | null;          // 주소 2
    CPHONE_NO: string | null;      // 휴대폰번호
    SOURCE_CD: string | null;      // 출처 코드
    USERGRADE_CD: string | null;   // 사용자 등급 코드
    DEPARTMENT_CD: string | null;  // 학과 코드
    LIBRARIAN_YN2: string | null;  // 사서 여부2
    KOREAN_NM: string | null;      // 한글명 (구분)
    REMARK1: string | null;        // 비고 1
    REGIST_NO: string | null;      // 등록번호
    REMARK2: string | null;        // 비고 2
    ORG_NM: string | null;         // 조직명
    ADDR: string | null;           // 주소
    LOGIN_DT: any;                 // 마지막 로그인 일시
    CREATE_DT: string | null;      // 생성 일시
    COLLEGE_CD: string | null;     // 단과대 코드
    USER_PWD: string | null;       // 비밀번호(평문)
    USER_BARCD: string | null;     // 사용자 바코드
}