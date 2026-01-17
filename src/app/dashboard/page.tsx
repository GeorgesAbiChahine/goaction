"use client"
import { useUser } from "@auth0/nextjs-auth0/client";

export default function Page() {
    const { user } = useUser();
    return (
        <div className="flex flex-col w-full max-w-4xl h-full mx-auto">
            <div className="text-4xl font-(family-name:--font-instrument-serif)">Welcome back, <i>{user?.name}</i> </div>
        </div>
    )
}
