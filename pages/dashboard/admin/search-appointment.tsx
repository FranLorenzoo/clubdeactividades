import Searchbar from "@/components/admin/search-appoin";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function SearchAppointment() {
  return (
    <DashboardLayout role="ADMIN">
      <h1 className="text-3xl font-bold mb-6">
        Ver turnos
      </h1> 
      <Searchbar />
    </DashboardLayout>
    );
}