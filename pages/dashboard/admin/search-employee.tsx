import Searchbar from "@/components/admin/search-bar-employee";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function SearchEmployee() {
  return (
    <DashboardLayout role="ADMIN">
      <h1 className="text-white text-3xl font-bold mb-6">
        Empleados
      </h1> 
      <Searchbar />
    </DashboardLayout>
    );
}