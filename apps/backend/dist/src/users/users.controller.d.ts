import { UsersService } from './users.service';
export declare class UsersController {
    private readonly svc;
    constructor(svc: UsersService);
    findAll(t: string, dto: any): Promise<any>;
    findById(t: string, id: string): Promise<any>;
    create(t: string, body: any): Promise<any>;
    update(t: string, id: string, body: any): Promise<any>;
    deactivate(t: string, id: string): Promise<{
        success: boolean;
    }>;
}
