import Searchbar from "@/components/admin/searchbar";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function SearchClient() {
  return (
    <DashboardLayout role="ADMIN">
      <h1 className="text-3xl font-bold mb-6">
        Empleados
      </h1> 
      <Searchbar />
    </DashboardLayout>
    );
}