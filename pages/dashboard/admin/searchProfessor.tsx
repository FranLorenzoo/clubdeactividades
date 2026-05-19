import Searchbar from "@/components/admin/searchbarProfessor"; 
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function searchProfessor() {
  return (
    <DashboardLayout role="ADMIN">
      <h1 className="text-3xl font-bold mb-6">
        Profesores
      </h1> 
      <Searchbar />
    </DashboardLayout>
    );
}