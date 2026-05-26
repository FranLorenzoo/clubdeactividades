import SearchBar from "@/components/admin/search-appoin";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function AdminHomePage() {

  return (
    <DashboardLayout role="ADMIN" >
      <SearchBar/>
    </DashboardLayout>
  );
}