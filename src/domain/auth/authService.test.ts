import { Auth } from './auth';
import { AuthRepository } from './authRepository.interface';
import { AuthService } from './authService';

describe('AuthService', () => {
    let authService: AuthService;
    let mockAuthRepository: jest.Mocked<AuthRepository>;

    beforeEach(() => {
        mockAuthRepository = {
            validateToken: jest.fn(),
            login: jest.fn(),
        } as jest.Mocked<AuthRepository>;
        authService = new AuthService(mockAuthRepository);
    });

    describe('validateToken', () => {
        it('토큰 검증 시 repository의 validateToken을 올바른 토큰으로 호출해야 함', async () => {
            const mockAuth = { accessToken: 'test-token' } as Auth;
            mockAuthRepository.validateToken.mockResolvedValue(true);

            const result = await authService.validateToken(mockAuth);

            expect(mockAuthRepository.validateToken).toHaveBeenCalledWith('test-token');
            expect(result).toBe(true);
        });

        it('토큰 검증에 실패하면 false를 반환해야 함', async () => {
            const mockAuth = { accessToken: 'invalid-token' } as Auth;
            mockAuthRepository.validateToken.mockResolvedValue(false);

            const result = await authService.validateToken(mockAuth);

            expect(result).toBe(false);
        });

        it('빈 토큰을 처리해야 함', async () => {
            const mockAuth = { accessToken: '' } as Auth;

            await authService.validateToken(mockAuth);

            expect(mockAuthRepository.validateToken).toHaveBeenCalledWith('');
        });
    });

    describe('login', () => {
        it('로그인 시 repository의 login을 올바른 자격 증명으로 호출하고 결과를 반환해야 함', async () => {
            const mockAuth = { accessToken: 'test-token' } as Auth;
            mockAuthRepository.login.mockResolvedValue(mockAuth);

            const result = await authService.login('testId', 'testPassword');

            expect(mockAuthRepository.login).toHaveBeenCalledWith('testId', 'testPassword');
            expect(result).toEqual(mockAuth);
        });

        it('로그인 중 repository에서 오류가 발생하면 처리해야 함', async () => {
            mockAuthRepository.login.mockRejectedValue(new Error('Login failed'));

            await expect(authService.login('testId', 'wrongPassword'))
                .rejects.toThrow('Login failed');
        });

        it('빈 자격 증명을 처리해야 함', async () => {
            await authService.login('', '');

            expect(mockAuthRepository.login).toHaveBeenCalledWith('', '');
        });
    });
});