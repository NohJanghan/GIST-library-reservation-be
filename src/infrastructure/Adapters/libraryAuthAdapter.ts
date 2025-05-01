import * as auth from "../../domain/auth/auth";
import { AuthRepository } from "../../domain/auth/authRepository.interface";
import { LoginResponse } from "../../domain/auth/dto.interface";

export class LibraryAuthAdapter implements AuthRepository {

    async validateToken(accessToken: string): Promise<boolean> {
        try {
            const getAccountPath = '/hello/getAccount'
            const response = await fetch(process.env.GIST_LIBRARY_URL + ':' + process.env.GIST_LIBRARY_PORT + getAccountPath, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            })
            if (!response.ok) {
                return false
            }
            const result = await response.json();
            if (!result.data) {
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error validating token:', error)
            return false
        }

    }

    async login(userId: string, userPwd: string): Promise<auth.Auth> {
        const loginPath = '/hello/login'
        try {
            const response = await fetch(process.env.GIST_LIBRARY_URL + ':' + process.env.GIST_LIBRARY_PORT + loginPath, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    userPwd,
                }),
            });

            if (!response.ok) {
                // HTTP 응답 코드가 실패인 경우
                throw new auth.AuthenticationFailedException();
            }

            const data: LoginResponse = await response.json();
            if (data.data === null || data.data.success === false) {
                // 응답은 성공했으나 로그인이 실패한 경우 (잘못된 자격 증명 가능성 높음)
                throw new auth.InvalidCredentialsException();
            }

            const token = data.data.token
            if (token.type !== 'Bearer') {
                // 토큰 형식 오류
                throw new auth.AuthenticationFailedException('Unable to process authentication token');
            }

            return new auth.Auth({
                accessToken: token.accessToken,
                refreshToken: token.refreshToken,
                expiredAt: token.expire,
                type: token.type,
            });
        } catch (error) {
            // 이미 도메인 예외라면 그대로 전달
            if (error instanceof auth.AuthenticationException) {
                throw error;
            }
            // 네트워크 오류 등 기타 예외는 일반 인증 실패 예외로 변환
            throw new auth.AuthenticationFailedException();
        }
    }
}