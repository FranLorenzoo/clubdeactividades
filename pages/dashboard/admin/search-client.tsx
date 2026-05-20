import Searchbar from "@/components/admin/search-bar-client";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function SearchClient() {
  return (
    <DashboardLayout role="ADMIN">
      <h1 className="text-white text-3xl font-bold mb-6">
        Clientes
      </h1> 
      <Searchbar />
    </DashboardLayout>
    );
}