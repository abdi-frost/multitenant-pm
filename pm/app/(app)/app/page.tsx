'use client';

import { useAuth } from '@/providers/AuthProvider'

export default function AppPage() {

    const { user, loading } = useAuth()

    if (loading) return <div>loading...</div>

    return (
        <div>Welcome {user?.name}!</div>
    )
}
