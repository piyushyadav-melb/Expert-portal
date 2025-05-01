import DashboardLayout from "@/components/layout/dashboard-layout";

const layout = async ({ children }: { children: React.ReactNode }) => {
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default layout;
