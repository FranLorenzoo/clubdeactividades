import Link from "next/link";
import { useRouter } from "next/router";

export default function EmployeeNavbar() {

  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("userId");
    router.push("/");
  }

  return (
    <aside className="sticky top-0 h-screen w-64 bg-zinc-900 border-r border-zinc-800 overflow-y-auto no-scrollbar">

      <div>

        <div className="px-7 py-8 border-b border-zinc-800">
          <Link
            href="/"
            className="text-4xl font-extrabold text-[#fdfdfd]"
          >
            Club
            <span className="text-green-500">
              360
            </span>
          </Link>
        </div>

        <nav className="flex flex-col gap-4 px-6 py-8">

          <Link
            href="/dashboard/employee/search-client"
            className="text-left px-5 py-4 rounded-2xl border border-zinc-700 text-zinc-100 hover:bg-zinc-800 transition"
          >
            Ver Clientes
          </Link>

          <Link
            href="/dashboard/employee/scan-qr"
            className="text-left px-5 py-4 rounded-2xl border border-zinc-700 text-zinc-100 hover:bg-zinc-800 transition"
          >
            Escanear QR
          </Link>

          <Link
            href="/dashboard/profile"
            className="text-left px-5 py-4 rounded-2xl border border-zinc-700 text-zinc-100 hover:bg-zinc-800 transition"
          >
            Mi Perfil
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