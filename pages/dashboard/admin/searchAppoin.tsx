import Searchbar from "@/components/admin/searchAppoin";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function SearchAppointment() {
  return (
    <DashboardLayout role="ADMIN">
      <Searchbar />
    </DashboardLayout>
    );
}