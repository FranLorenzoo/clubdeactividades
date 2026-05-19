import { ReactNode } from "react";
import AdminNavbar from "./Navbar/AdminNavbar";
import ClientNavbar from "./Navbar/ClientNavbar";
import EmployeeNavbar from "./Navbar/EmployeeNavbar";
import ProfessorNavbar from "./Navbar/ProfessorNavbar";

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