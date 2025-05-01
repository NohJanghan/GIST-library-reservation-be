import { LibraryAuthAdapter } from './libraryAuthAdapter';
import * as auth from '../../domain/auth/auth';
import { LoginResponse, LoginSuccessData } from '../../domain/auth/dto.interface';

// 원래 fetch 함수를 저장
const originalFetch = global.fetch;

describe('LibraryAuthAdapter', () => {
  let libraryAuthAdapter: LibraryAuthAdapter;

  beforeEach(() => {
    libraryAuthAdapter = new LibraryAuthAdapter();
    // 환경 변수 설정
    process.env.GIST_LIBRARY_URL = 'https://library.gist.ac.kr';
    process.env.GIST_LIBRARY_PORT = '8443';
  });

  afterEach(() => {
    // 테스트 후 fetch 복원
    global.fetch = originalFetch;
    // 환경 변수 초기화
    delete process.env.GIST_LIBRARY_URL;
    delete process.env.GIST_LIBRARY_PORT;
  });

  describe('login', () => {
    it('올바른 자격 증명으로 로그인 시 Auth 객체를 반환해야 함', async () => {
      // Arrange - 성공적인 로그인 응답 모의 설정
      const mockResponse: LoginResponse = {
        status: 200,
        message: 'OK',
        data: {
          success: true,
          accessToken: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyMDIzNTA1OSIsImF1dGgiOiJST0xFX1VTRVIiLCJleHAiOjE3NDU4MTkyNjB9.9mjb4PAMr_DumiJakamC3YhuPwq4yfMsn4zp6unNtXM',
          token: {
            accessToken: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyMDIzNTA1OSIsImF1dGgiOiJST0xFX1VTRVIiLCJleHAiOjE3NDU4MTkyNjB9.9mjb4PAMr_DumiJakamC3YhuPwq4yfMsn4zp6unNtXM',
            refreshToken: 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3NDU4MTkyNjB9.hjYUOU0qMwgVUAwjHDcccqxdrrL6FpI2aK7sCSeFGOk',
            type: 'Bearer',
            expire: 1745819260
          }
        } as LoginSuccessData,
        timestamp: '2025-04-28 10:47:40',
        path: '/hello/login'
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      // Act
      const result = await libraryAuthAdapter.login('20235889', 'rightPassword1!');

      // Assert
      expect(fetch).toHaveBeenCalledWith(
        process.env.GIST_LIBRARY_URL + ':' + process.env.GIST_LIBRARY_PORT + '/hello/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            userId: '20235889',
            userPwd: 'rightPassword1!'
          })
        })
      );

      expect(result).toBeInstanceOf(auth.Auth);
      expect(result.accessToken).toBe((mockResponse.data as LoginSuccessData).token.accessToken);
      expect(result.refreshToken).toBe((mockResponse.data as LoginSuccessData).token.refreshToken);
      expect(result.type).toBe((mockResponse.data as LoginSuccessData).token.type);
      expect(result.expiredAt).toBe((mockResponse.data as LoginSuccessData).token.expire);
    });

    it('잘못된 비밀번호로 로그인 시 InvalidCredentialsException을 던져야 함', async () => {
      // Arrange - 실패한 로그인 응답 모의 설정
      const mockResponse: LoginResponse = {
        status: 200,
        message: 'OK',
        data: {
          success: false
        },
        timestamp: '2025-04-28 10:53:37',
        path: '/hello/login'
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      // Act & Assert
      await expect(libraryAuthAdapter.login('20235889', 'thisIsWrongPw1!'))
        .rejects.toThrow(auth.InvalidCredentialsException);

      expect(fetch).toHaveBeenCalledWith(
        process.env.GIST_LIBRARY_URL + ':' + process.env.GIST_LIBRARY_PORT + '/hello/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            userId: '20235889',
            userPwd: 'thisIsWrongPw1!'
          })
        })
      );
    });

    it('존재하지 않는 사용자로 로그인 시 AuthenticationFailedException을 던져야 함', async () => {
      // Arrange - 서버 오류 응답 모의 설정
      const mockResponse: LoginResponse = {
        status: 501,
        message: 'java.lang.NullPointerException',
        data: null,
        timestamp: '2025-04-28 10:54:48',
        path: '/hello/login'
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,  // HTTP 오류 응답
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      // Act & Assert
      await expect(libraryAuthAdapter.login('20235999', 'password1!'))
        .rejects.toThrow(auth.AuthenticationFailedException);

      expect(fetch).toHaveBeenCalledWith(
        process.env.GIST_LIBRARY_URL + ':' + process.env.GIST_LIBRARY_PORT + '/hello/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            userId: '20235999',
            userPwd: 'password1!'
          })
        })
      );
    });

    it('네트워크 오류 발생 시 AuthenticationFailedException을 던져야 함', async () => {
      // Arrange - 네트워크 오류 모의 설정
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(libraryAuthAdapter.login('20235889', 'password1!'))
        .rejects.toThrow(auth.AuthenticationFailedException);
    });

    it('잘못된 토큰 타입 응답 시 AuthenticationFailedException을 던져야 함', async () => {
      // Arrange - 잘못된 토큰 타입 응답 모의 설정
      const mockResponse: LoginResponse = {
        status: 200,
        message: 'OK',
        data: {
          success: true,
          accessToken: 'some-token',
          token: {
            accessToken: 'some-token',
            refreshToken: 'refresh-token',
            type: 'Unknown' as any, // 'Bearer'가 아닌 다른 타입
            expire: 1745819260
          }
        },
        timestamp: '2025-04-28 10:47:40',
        path: '/hello/login'
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      // Act & Assert
      await expect(libraryAuthAdapter.login('20235889', 'password1!'))
        .rejects.toThrow(auth.AuthenticationFailedException);
    });
  });

  describe('validateToken', () => {
    it('성공적인 응답에 대해 true를 반환해야 함', async () => {
      // Arrange - 성공적인 응답 모의 설정 (res 1)
      const mockSuccessResponse = {
        status: 200,
        message: "OK",
        data: {
          result: {
            USER_ID: "20235889",
            USER_NM: "홍길동",
            EMAIL1: "john.doe@gm.gist.ac.kr",
            DEPARTMENT_CD_NM: "전기전자컴퓨터공학과",
            // 기타 사용자 정보는 생략
          },
          AUTHCODE: "a8hem1hp558jgwtilwbudnkvir1msypiy05re4vpjqv7gke65f"
        },
        timestamp: "2025-04-28 11:00:26",
        path: "/hello/getAccount"
      };

      const mockResponseText = JSON.stringify(mockSuccessResponse);

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockSuccessResponse),
        text: jest.fn().mockResolvedValue(mockResponseText)
      });

      // Act
      const result = await libraryAuthAdapter.validateToken('valid-token');

      // Assert
      expect(fetch).toHaveBeenCalledWith(
        process.env.GIST_LIBRARY_URL + ':' + process.env.GIST_LIBRARY_PORT + '/hello/getAccount',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': 'Bearer valid-token'
          }
        })
      );
      expect(result).toBe(true);
    });

    it('data가 null인 응답에 대해 false를 반환해야 함', async () => {
      // Arrange - null data 응답 모의 설정 (res 2)
      const mockNullDataResponse = {
        status: 501,
        message: "java.lang.NullPointerException",
        data: null,
        timestamp: "2025-04-28 11:03:29",
        path: "/hello/getAccount"
      };

      const mockResponseText = JSON.stringify(mockNullDataResponse);

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockNullDataResponse),
        text: jest.fn().mockResolvedValue(mockResponseText)
      });

      // Act
      const result = await libraryAuthAdapter.validateToken('invalid-token');

      // Assert
      expect(result).toBe(false);
    });

    it('네트워크 오류 발생 시 false를 반환해야 함', async () => {
      // Arrange - 네트워크 오류 모의 설정
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      // Act
      const result = await libraryAuthAdapter.validateToken('any-token');

      // Assert
      expect(result).toBe(false);
    });

    it('JSON이 아닌 데이터로 응답할 때 false를 반환해야 함', async () => {
      // Arrange - HTML 응답 모의 설정
      const mockHtmlResponse = `
        <!doctype html>
        <html lang="en">
          <head>
            <title>HTTP Status 500 - Internal Server Error</title>
          </head>
          <body>
            <h1>HTTP Status 500 - Internal Server Error</h1>
          </body>
        </html>
      `;

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(mockHtmlResponse),
        json: jest.fn().mockRejectedValue(new SyntaxError('Unexpected token < in JSON at position 0'))
      });

      // Act
      const result = await libraryAuthAdapter.validateToken('expired-token');

      // Assert
      expect(result).toBe(false);
    });
  });
});
