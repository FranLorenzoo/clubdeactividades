import DashboardLayout from "@/components/layout/DashboardLayout";

export default function EmployeeHomePage() {

  return (
    <DashboardLayout role="EMPLOYEE" >
      <h1 className="text-white text-3xl font-bold">
        Panel empleado
      </h1>
    </DashboardLayout>
  );
}