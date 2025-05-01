export interface AuthProps {
    accessToken: string;  // 엑세스 토큰 (예: JWT)
    refreshToken: string; // 리프레시 토큰
    type: "Bearer";         // 토큰 타입 (예: "Bearer")
    expiredAt: number;       // UNIX 타임스탬프(초) 형식의 만료 시각
}

export class Auth {
    public accessToken: string;
    public refreshToken: string;
    public type: "Bearer";
    public expiredAt: number;

    constructor(props: AuthProps) {
        this.accessToken = props.accessToken
        this.refreshToken = props.refreshToken
        this.type = props.type
        this.expiredAt = props.expiredAt
    }

    isExpired(): boolean {
        const currentTime = Math.floor(Date.now() / 1000); // 현재 시간을 초 단위로 가져옴
        return this.expiredAt < currentTime; // 만료 여부를 확인
    }
}

// 인증 관련 예외 클래스
export class AuthenticationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationException';
  }
}

// 사용자 자격 증명 오류 (ID/PW 오류)
export class InvalidCredentialsException extends AuthenticationException {
  constructor() {
    super('Invalid credentials provided');
    this.name = 'InvalidCredentialsException';
  }
}

// 이외의 인증 실패 예외 클래스
export class AuthenticationFailedException extends AuthenticationException {
  constructor(message = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationFailedException';
  }
}