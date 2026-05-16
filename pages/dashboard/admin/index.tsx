import DashboardLayout from "@/components/layout/DashboardLayout";

export default function AdminHomePage() {

  return (
    <DashboardLayout role="ADMIN" >
      <h1 className="text-3xl font-bold">
        Panel administrador
      </h1>
    </DashboardLayout>
  );
}