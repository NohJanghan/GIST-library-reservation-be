import { Auth, AuthProps, AuthenticationException, InvalidCredentialsException, AuthenticationFailedException } from './auth';

describe('Auth', () => {
  describe('constructor', () => {
    it('should set all properties correctly', () => {
      // Arrange
      const props: AuthProps = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        type: 'Bearer',
        expiredAt: 1234567890,
      };

      // Act
      const auth = new Auth(props);

      // Assert
      expect(auth.accessToken).toBe(props.accessToken);
      expect(auth.refreshToken).toBe(props.refreshToken);
      expect(auth.type).toBe(props.type);
      expect(auth.expiredAt).toBe(props.expiredAt);
    });
  });

  describe('isExpired', () => {
    it('should return true if token has expired', () => {
      // Arrange - 만료된 토큰 생성
      const pastTime = Math.floor(Date.now() / 1000) - 100; // 100초 전에 만료됨
      const auth = new Auth({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        type: 'Bearer',
        expiredAt: pastTime,
      });

      // Act & Assert
      expect(auth.isExpired()).toBe(true);
    });

    it('should return false if token has not expired', () => {
      // Arrange - 아직 만료되지 않은 토큰 생성
      const futureTime = Math.floor(Date.now() / 1000) + 100; // 100초 후에 만료됨
      const auth = new Auth({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        type: 'Bearer',
        expiredAt: futureTime,
      });

      // Act & Assert
      expect(auth.isExpired()).toBe(false);
    });
  });
});

describe('Authentication Exceptions', () => {
  describe('AuthenticationException', () => {
    it('should set name and message correctly', () => {
      // Arrange & Act
      const errorMessage = 'Authentication error';
      const error = new AuthenticationException(errorMessage);

      // Assert
      expect(error.name).toBe('AuthenticationException');
      expect(error.message).toBe(errorMessage);
    });
  });

  describe('InvalidCredentialsException', () => {
    it('should set name and message correctly', () => {
      // Act
      const error = new InvalidCredentialsException();

      // Assert
      expect(error.name).toBe('InvalidCredentialsException');
      expect(error.message).toBe('Invalid credentials provided');
    });
  });

  describe('AuthenticationFailedException', () => {
    it('should set name and default message correctly', () => {
      // Act
      const error = new AuthenticationFailedException();

      // Assert
      expect(error.name).toBe('AuthenticationFailedException');
      expect(error.message).toBe('Authentication failed');
    });

    it('should set name and custom message correctly', () => {
      // Act
      const customMessage = 'Custom auth failure message';
      const error = new AuthenticationFailedException(customMessage);

      // Assert
      expect(error.name).toBe('AuthenticationFailedException');
      expect(error.message).toBe(customMessage);
    });
  });
});
