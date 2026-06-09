export declare class PaginationDto {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
export declare class DateRangeDto extends PaginationDto {
    dateFrom?: string;
    dateTo?: string;
}
