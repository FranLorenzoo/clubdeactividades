import ActivityAppointments from "@/components/appointment/activity-appointments";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function searchProfessor() {
  return (
    <DashboardLayout role="ADMIN">
      <ActivityAppointments />
    </DashboardLayout>
    );
}