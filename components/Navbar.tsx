import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Navbar() {
  type User = { id: string; email: string; rol: string };
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 border-r border-zinc-800 bg-zinc-900 flex flex-col justify-between">
      <div className="px-6 py-5">
        <Link href="/" className="text-2xl font-bold tracking-wide">
          Club<span className="text-green-500">360</span>
        </Link>
      </div>
      <nav className="flex flex-col gap-3 px-6 py-5">
        {user ? (
          <>
            {user.rol === "2" && (
              <Link
                href="/miPerfil"
                className="px-5 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-800 transition"
              >
                Mi Perfil
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="px-5 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-800 transition"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="px-5 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-800 transition"
            >
              Iniciar sesión
            </Link>

            <Link
              href="/register"
              className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 transition"
            >
              Registrarse
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}
