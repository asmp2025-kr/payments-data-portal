import { SearchService } from './search.service';
export declare class SearchController {
    private readonly svc;
    constructor(svc: SearchService);
    search(t: string, q: string, type?: string): Promise<any>;
}
