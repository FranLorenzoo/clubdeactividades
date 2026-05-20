import CreateAppointmentForm from "@/components/appointment/create-appointment-form";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function CreateAppointment() {
  return (
    <DashboardLayout role="ADMIN">
      <CreateAppointmentForm />
    </DashboardLayout>
    );
}