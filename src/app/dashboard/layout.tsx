import { DashboardSidebar } from "@/components/sidebar-03/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <SidebarProvider>
                <div className="relative flex h-screen w-full">
                    <DashboardSidebar />
                    <SidebarInset className="flex flex-col">
                        {children}
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </div>
    )
}