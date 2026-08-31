"use client";

import ReportsSidebar from "@/app/modules/reports/ReportsSidebar";

type Props = {
    activeReport: string;
    setActiveReport: React.Dispatch<React.SetStateAction<string>>;
};

export default function DesktopReportsSidebar(props: Props) {
    return (
        <ReportsSidebar
            {...props}
            desktop
        />
    );
}