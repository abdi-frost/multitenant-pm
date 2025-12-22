export interface DataResponse<T> {
    data: T | null;
    error?: string;
    message?: string;
    success: boolean;
}

export type Pagination = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ListResponse<T> {
    data: T[];
    pagination: Pagination;
    error?: string;
    message?: string;
    success: boolean;
    summary?: Record<string, unknown>;
}
