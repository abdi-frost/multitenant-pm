function getRequiredEnvUrl(name: string, devDefault: string): string {
    const value = process.env[name];

    if (process.env.NODE_ENV === "production" && !value) {
        throw new Error(`Environment variable ${name} is required in production.`);
    }

    return value || devDefault;
}

export const URLS = {
    ADMIN_APP: getRequiredEnvUrl("NEXT_PUBLIC_ADMIN_URL", "http://localhost:3002"),
    PM_APP: getRequiredEnvUrl("NEXT_PUBLIC_PM_URL", "http://localhost:3001"),
    CORE_API: getRequiredEnvUrl("NEXT_PUBLIC_CORE_API_URL", "http://localhost:3000"),
}