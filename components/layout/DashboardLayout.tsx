import { ReactNode } from "react";
import AdminNavbar from "./Navbar/admin-navbar";
import ClientNavbar from "./Navbar/client-navbar";
import EmployeeNavbar from "./Navbar/employee-navbar";
import ProfessorNavbar from "./Navbar/professor-navbar";

type Role = "ADMIN" | "CLIENT" | "EMPLOYEE" | "PROFESSOR";
type DashboardLayoutProps = {
  role: Role,
  children: ReactNode
}

export default function DashboardLayout({ role, children }: DashboardLayoutProps) {

  return (
    <div className="flex min-h-screen bg-zinc-950">

      {role === "CLIENT" && <ClientNavbar />}
      {role === "ADMIN" && <AdminNavbar />}
      {role === "EMPLOYEE" && <EmployeeNavbar />}
      {role === "PROFESSOR" && <ProfessorNavbar />}

      <main className="flex-1 bg-zinc-950 text-white p-8">
        {children}
      </main>
    </div>
  );
}