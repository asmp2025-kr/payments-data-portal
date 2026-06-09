import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
export declare class SimpleAuthService {
    private readonly jwtService;
    private readonly dataSource;
    constructor(jwtService: JwtService, dataSource: DataSource);
    login(email: string, password: string): Promise<{
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
    me(userId: string): Promise<any>;
    changePassword(userId: string, newPassword: string): Promise<{
        message: string;
    }>;
}
