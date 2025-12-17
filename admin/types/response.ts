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

export interface ListResponse<T, S = Record<string, unknown>> {
    data: T[];
    pagination: Pagination;
    error?: string;
    message?: string;
    success: boolean;
    summary: S;
}

export class ResponseFactory {
    static createDataResponse<T>(data: T | null, message?: string): DataResponse<T> {
        return {
            data,
            success: true,
            message,
        };
    }

    static createDataListResponse<T, S = Record<string, unknown>>(
        data: T[],
        total: number,
        page: number,
        limit: number,
        message?: string,
        summary?: S,
    ): ListResponse<T, S> {
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
            summary: (summary ?? ({} as S)),
        };
    }

    static createListResponse<T, S = Record<string, unknown>>(
        data: T[],
        pagination: Pagination,
        message?: string,
        summary?: S,
    ): ListResponse<T, S> {
        return {
            data,
            pagination,
            success: true,
            message,
            summary: (summary ?? ({} as S)),
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
