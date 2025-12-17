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
    summary: Record<string, unknown>;
}

export class ResponseFactory {
    static createDataResponse<T>(data: T | null, message?: string): DataResponse<T> {
        return {
            data,
            success: true,
            message,
        };
    }

    static createDataListResponse<T>(data: T[], total: number, page: number, limit: number, message?: string, summary?: Record<string, unknown>): ListResponse<T> {
        return {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            success: true,
            message,
            summary: summary || {}
        };
    }

    static createListResponse<T>(data: T[], pagination: Pagination, message?: string, summary?: Record<string, unknown>): ListResponse<T> {
        return {
            data,
            pagination,
            success: true,
            message,
            summary: summary || {}
        };
    }

    static createSuccessResponse(message: string): DataResponse<null> {
        return {
            data: null,
            success: true,
            message,
        };
    }

    static createErrorResponse<T>(error: string, message?: string): DataResponse<T> {
        return {
            data: null,
            success: false,
            error,
            message,
        };
    }

}
