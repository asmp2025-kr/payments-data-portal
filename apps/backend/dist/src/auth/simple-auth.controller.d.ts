import { SimpleAuthService } from './simple-auth.service';
export declare class SimpleAuthController {
    private readonly authService;
    constructor(authService: SimpleAuthService);
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            first_name: any;
            last_name: any;
            role: any;
            tenant_id: any;
        };
    }>;
    me(req: any): Promise<any>;
    changePassword(req: any, body: {
        password: string;
    }): Promise<{
        message: string;
    }>;
}
