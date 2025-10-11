import DashboardSummarySection from "./components/DashboardSummarySection";
import DashboardPerformanceChart from "./components/DashboardPerformanceChart";
import DashboardRecentActivityCard from "./components/DashboardRecentActivityCard";
import DashboardSpendingProfileCard from "./components/DashboardSpendingProfileCard";
import DashboardCashFlowForecastCard from "./components/DashboardCashFlowForecastCard";

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <DashboardSummarySection />

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <DashboardPerformanceChart />
          <div className="grid gap-6 lg:grid-cols-2">
            <DashboardRecentActivityCard />
            <DashboardSpendingProfileCard />
          </div>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <DashboardCashFlowForecastCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
