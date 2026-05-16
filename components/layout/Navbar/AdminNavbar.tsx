import Link from "next/link";
import { useRouter } from "next/router";

export default function AdminNavbar() {

  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("user");
    router.push("/");
  }

  return (
    <aside className="h-screen w-64 shrink-0 border-r border-[#4a5568] bg-[#373F4B] flex flex-col justify-between">

      <div>

        <div className="px-7 py-8 border-b border-[#4a5568]">
          <Link
            href="/dashboard/admin"
            className="text-4xl font-extrabold text-[#fdfdfd]"
          >
            Club
            <span className="text-[#F59134]">
              360
            </span>
          </Link>
        </div>

        <nav className="flex flex-col gap-4 px-6 py-8">

          <Link
            href="/dashboard/admin/appointments/create"
            className="text-left px-5 py-4 rounded-2xl border border-[#4a5568] text-[#fdfdfd] hover:bg-[#316788] transition"
          >
            Crear turno
          </Link>

          <Link
            href="/dashboard/admin/users"
            className="text-left px-5 py-4 rounded-2xl border border-[#4a5568] text-[#fdfdfd] hover:bg-[#316788] transition"
          >
            Ver clientes
          </Link>

          <Link
            href="/dashboard/admin/employees"
            className="text-left px-5 py-4 rounded-2xl border border-[#4a5568] text-[#fdfdfd] hover:bg-[#316788] transition"
          >
            Ver empleados
          </Link>

          <Link
            href="/dashboard/admin/searchclient"
            className="text-left px-5 py-4 rounded-2xl border border-[#4a5568] text-[#fdfdfd] hover:bg-[#316788] transition"
          >
            Buscar Clientes
          </Link>

        </nav>
      </div>

      <div className="p-6">

        <button
          onClick={handleLogout}
          className="w-full bg-[#F59134] hover:opacity-90 text-white py-4 rounded-2xl font-semibold transition"
        >
          Cerrar sesión
        </button>

      </div>

    </aside>
  );
}