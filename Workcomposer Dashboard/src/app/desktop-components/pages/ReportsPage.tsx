import ReportsModule from "@/app/modules/reports/ReportsModule";
import DesktopPageHeader from "../common/DesktopPageHeader";

export default function ReportsPage() {
   return (
    <>
        <DesktopPageHeader />

        <div className="pt-[45px]">
            <ReportsModule />
        </div>
    </>
)
}