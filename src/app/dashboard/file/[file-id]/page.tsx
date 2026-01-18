import FilePage from "./client-page";

// Required for static export with dynamic routes
export async function generateStaticParams() {
    return [];
}

export default function Page() {
    return <FilePage />;
}