import { AppSidebar } from "@/components/AppSidebar";
import { SiteHeader } from "@/components/SiteHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CountsProvider, useCounts } from "@/context/counts";
import { STAGE_PATH } from "@/lib/stage";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useEffect } from "react";

const stagePages = new Set(Object.values(STAGE_PATH));

function StageGate() {
    const { stage } = useCounts();
    const { pathname } = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const home = STAGE_PATH[stage] || "/";
        if (stagePages.has(pathname) && pathname !== home) {
            navigate(home, { replace: true });
        } else if (stage !== "individual" && pathname === "/teams") {
            navigate(home, { replace: true });
        }
    }, [stage, pathname, navigate]);

    return null;
}

export default function MainLayout() {

    return (
        <CountsProvider>
        <StageGate />
        <SidebarProvider
            style={{
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
            }}
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-col flex-1">
                    <div className="@container/main flex flex-col flex-1 gap-2">
                        <Outlet />
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
        </CountsProvider>
    );
}
