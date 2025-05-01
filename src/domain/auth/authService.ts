import { Auth } from "./auth";
import { AuthRepository } from "./authRepository.interface";

export class AuthService {
    private authRepository: AuthRepository;

    constructor(authRepository: AuthRepository) {
        this.authRepository = authRepository;
    }

    async validateToken(auth: Auth): Promise<boolean> {
        return await this.authRepository.validateToken(auth.accessToken);
    }

    async login(id: string, password: string): Promise<Auth> {
        const result =  await this.authRepository.login(id, password)
        return result
    }
}