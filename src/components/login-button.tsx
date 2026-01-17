"use client";

import { Button } from "./ui/button";

export default function LoginButton() {
    return (
        <a
            href="/auth/login"
        >
            <Button className="w-full">Continue</Button>
        </a>
    );
}