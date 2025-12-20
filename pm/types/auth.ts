import { Session, User } from "better-auth";
// import { User } from "./user";

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: LoginCredentials) => Promise<LoginResponse>;
    logout: () => Promise<LogoutResponse>;
    getSession: () => Promise<SessionResponse>;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface Data<T> {
    data: T;
}

export interface Error$1<E> {
    error: E;
}

export type LoginResponse = Data<{
    redirect: boolean;
    token: string;
    url?: string | undefined;
    user: User;
}> | Error$1<{
    code?: string | undefined;
    message?: string | undefined;
}>;

export type LogoutResponse =
    | Data<{
        success: boolean;
    }>
    | Error$1<{
        code?: string | undefined;
        message?: string | undefined;
    }>;

export type SessionResponse =
    Data<{
        user: User;
        session: Session;
    } | null> | Error$1<{
        code?: string | undefined;
        message?: string | undefined;
    }>
