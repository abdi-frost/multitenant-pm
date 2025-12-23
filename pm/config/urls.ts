const getEnvOrFail = (name: string, devFallback: string): string => {
    const value = process.env[name];

    if (process.env.NODE_ENV === 'production') {
        if (!value) {
            throw new Error(`Environment variable ${name} is required in production`);
        }
        return value;
    }

    return value || devFallback;
};

export const URLS = {
    ADMIN_APP: getEnvOrFail('NEXT_PUBLIC_ADMIN_URL', 'http://localhost:3002'),
    PM_APP: getEnvOrFail('NEXT_PUBLIC_PM_URL', 'http://localhost:3001'),
    CORE_API: getEnvOrFail('NEXT_PUBLIC_CORE_URL', 'http://localhost:3000'),
}