export interface BaseListRequest {
    page: number;
    limit: number;
}

export interface SearchRequest extends BaseListRequest {
    search?: string;
    status?: string;
}

export interface SortRequest extends BaseListRequest {
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}