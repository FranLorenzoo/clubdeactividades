import Link from "next/link";
import { useRouter } from "next/router";

export default function ProfessorNavbar() {

  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("user");
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
            <span className="text-green-500">
              360
            </span>
          </Link>
        </div>

        <nav className="flex flex-col gap-4 px-6 py-8">

          <Link
            href="/dashboard/professor/algo..."
            className="text-left px-5 py-4 rounded-2xl border border-zinc-700 text-zinc-100 hover:bg-zinc-800 transition"
          >
            Un Boton
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