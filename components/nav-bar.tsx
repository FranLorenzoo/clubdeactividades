import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const PANEL_URL: Record<string, string> = {
  CLIENT: "/dashboard/profile",
  ADMIN: "/dashboard/profile",
  EMPLOYEE: "/dashboard/profile",
  PROFESSOR: "/dashboard/profile",
};

export default function Navbar() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setUserId(localStorage.getItem("userId"));
    setUserRole(localStorage.getItem("userRole"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    setUserId(null);
    setUserRole(null);
    router.push("/");
  };

  const panelUrl = userRole ? (PANEL_URL[userRole] ?? "/") : "/";

  return (
    <header className="border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">

        <Link href="/" className="text-2xl text-white font-bold tracking-wide">
          Club<span className="text-green-500">360</span>
        </Link>

        <nav className="flex gap-3 items-center">
          {userId ? (
            <>
              <Link
                href={panelUrl}
                className="px-5 py-2 text-white rounded-xl border border-zinc-700 hover:bg-zinc-800 transition"
              >
                Mi panel
              </Link>
              <button
                onClick={handleLogout}
                className="px-5 py-2 text-white rounded-xl border border-zinc-700 hover:bg-zinc-800 transition"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-5 py-2 rounded-xl border text-white border-zinc-700 hover:bg-zinc-800 transition"
              >
                Iniciar sesión
              </Link>

              <Link
                href="/register"
                className="px-5 py-2 text-white rounded-xl bg-green-600 hover:bg-green-700 transition"
              >
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}