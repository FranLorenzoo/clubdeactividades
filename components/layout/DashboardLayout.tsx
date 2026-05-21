import { ReactNode } from "react";
import AdminNavbar from "./Navbar/AdminNavbar";
import ClientNavbar from "./Navbar/ClientNavbar";
import EmployeeNavbar from "./Navbar/EmployeeNavbar";
import ProfessorNavbar from "./Navbar/ProfessorNavbar";

type Role =
| "ADMIN"
| "CLIENT"
| "EMPLOYEE"
| "PROFESSOR";

type DashboardLayoutProps = {
  role: Role,
  children: ReactNode
}

export default function DashboardLayout({
  role,
  children
}: DashboardLayoutProps) {

  return (

    <div className="flex min-h-screen bg-[#09090B]">

      {role==="CLIENT" && (
        <ClientNavbar/>
      )}

      {role==="ADMIN" && (
        <AdminNavbar/>
      )}

      {role==="EMPLOYEE" && (
        <EmployeeNavbar/>
      )}

      {role==="PROFESSOR" && (
        <ProfessorNavbar/>
      )}

      <main className="flex-1">

        {children}

      </main>

    </div>

  );

}