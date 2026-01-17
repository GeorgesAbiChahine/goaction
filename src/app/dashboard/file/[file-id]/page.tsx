import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import Editor from "./editor";

export default function File() {
    return (
        <div className="flex flex-row w-full">
            <div className="w-full h-[500px] -mt-13">
                <Editor />
            </div>
            <Sidebar side="right" variant="floating">
                <SidebarHeader>
                    <div className="text-lg font-medium h-13.5 flex items-center">Toolbar</div>
                </SidebarHeader>
                <SidebarContent>

                </SidebarContent>
            </Sidebar>
        </div>
    )
}