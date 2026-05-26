import DashboardLayout from "@/components/layout/DashboardLayout";
import Searchbar from "@/components/admin/search-bar-client";

export default function EmployeeHomePage() {

  return (
    <DashboardLayout role="EMPLOYEE" >
      <h1 className="text-white text-3xl font-bold mb-6">
        Clientes
      </h1> 
      <Searchbar />
    </DashboardLayout>
  );
}