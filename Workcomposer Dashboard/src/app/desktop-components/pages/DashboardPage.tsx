import OrganizationCard from "../desktop/OrganizationCard";
import WorkTimeTrackingCard from "../desktop/WorkTrackingCard";
import CloudSyncCard from "../desktop/CloudSyncCard";
import TodaySummaryCard from "../desktop/SummaryCard";
import StatsRow from "../desktop/StatsRow";
import ChartSection from "../desktop/ChartsSection";

export default function DashboardPage() {

    return (

        <>
            <div className="p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
                    <OrganizationCard />

                    <WorkTimeTrackingCard />

                    <CloudSyncCard />

                    <TodaySummaryCard />
                </div>

                <div className="p-6">
                    <div className="bg-[#16253D] rounded-xl p-4 w-full">

                        <StatsRow />

                        <div className="border-t border-[#2A3D5E] mt-4 pt-4">
                            <ChartSection />
                        </div>
                    </div>
                </div>


            </div>
        </>

    );

}