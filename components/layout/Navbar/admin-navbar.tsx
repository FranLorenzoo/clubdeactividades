import Link from "next/link";
import { useRouter } from "next/router";

export default function AdminNavbar() {

  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("userId");
    router.push("/");
  }

  return (
    <aside className="sticky top-0 h-screen w-64 shrink-0 border-r border-zinc-800 bg-zinc-900 flex flex-col justify-between">

      <div>

        <div className="px-7 py-8 border-b border-zinc-800">
          <Link
            href="/"
            className="text-4xl font-extrabold text-[#fdfdfd]"
          >
            Club
            <span className="text-green-600">
              360
            </span>
          </Link>
        </div>

        <nav className="flex flex-col gap-4 px-6 py-8">

          <Link
            href="/dashboard/admin/create-appointment"
            className="text-left px-5 py-4 rounded-2xl border border-[#4a5568] text-[#fdfdfd] hover:bg-green-600 transition"
          >
            Crear Turno
          </Link>

          <Link
            href="/dashboard/admin/search-employee"
            className="text-left px-5 py-4 rounded-2xl border border-[#4a5568] text-[#fdfdfd] hover:bg-green-600 transition"
          >
            Ver empleados
          </Link>

          <Link
            href="/dashboard/admin/search-client"
            className="text-left px-5 py-4 rounded-2xl border border-[#4a5568] text-[#fdfdfd] hover:bg-[#316788] transition"
          >
            Ver Clientes
          </Link>
          
          <Link
            href="/dashboard/admin/search-professor"
            className="text-left px-5 py-4 rounded-2xl border border-[#4a5568] text-[#fdfdfd] hover:bg-[#316788] transition"
          >
            Ver Profesores 
          </Link>
          

          <Link
            href="/dashboard/admin/search-appoin"
            className="text-left px-5 py-4 rounded-2xl border border-[#4a5568] text-[#fdfdfd] hover:bg-[#316788] transition"
          >
            Ver Turnos
          </Link>
        </nav>
      </div>

      <div className="p-6">

        <button
          onClick={handleLogout}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-semibold transition"
        >
          Cerrar sesión
        </button>

      </div>

    </aside>
  );
}