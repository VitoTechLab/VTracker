import DashboardAreaChart from "./DashboardAreaChart";
import DashboardCard from "./DashboardCard";
import DashboardHistory from "./DashboardHistory";

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <DashboardCard />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <DashboardAreaChart />
        </div>
        <div className="xl:col-span-1">
          <DashboardHistory />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
