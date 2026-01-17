import { DashboardSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <SidebarProvider>
                <div className="relative flex h-screen w-full">
                    <DashboardSidebar />
                    <SidebarInset className="flex flex-col w-[calc(100vw-16rem)] px-5 pt-15 h-full">
                        {children}
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </div>
    )
}