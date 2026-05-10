import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Navbar() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setUserId(localStorage.getItem("userId"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    setUserId(null);
    router.push("/");
  };

  return (
    <header className="border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">

        <Link href="/" className="text-2xl font-bold tracking-wide">
          Club<span className="text-green-500">360</span>
        </Link>

        <nav className="flex gap-3 items-center">
          {userId ? (
            <button
              onClick={handleLogout}
              className="px-5 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-800 transition"
            >
              Cerrar sesión
            </button>
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
      </div>
    </header>
  );
}