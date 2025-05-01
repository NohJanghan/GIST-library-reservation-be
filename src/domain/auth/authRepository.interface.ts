import { Auth } from "./auth";
export interface AuthRepository {
    validateToken(accessToken: string): Promise<boolean>;
    login(id: string, password: string): Promise<Auth>;
    // getAccountInfo(auth: Auth): Promise<any>;
}
