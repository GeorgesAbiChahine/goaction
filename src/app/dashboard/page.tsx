"use client"
import { Button } from "@/components/ui/button";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function Page() {
    const { user } = useUser();
    return (
        <div>
            <a href="/auth/logout"><Button>Logout</Button></a>
            {user?.name}
        </div>
    )
}
