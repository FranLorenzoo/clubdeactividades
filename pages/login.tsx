import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Completá los campos");
      return;
    }
    const logInAttempt = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, role }),
    });

    if (!logInAttempt.ok) {
      alert("Credenciales incorrectas");
      return;
    }
    const logInSuccess = await logInAttempt.json();

    localStorage.setItem("userId", logInSuccess.id);
    localStorage.setItem("userRole", logInSuccess.role);
    switch(logInSuccess.role) {
      case "ADMIN":
        router.push("/dashboard/profile");
        break;

      case "CLIENT":
        router.push("/dashboard/profile");
        break;

      case "EMPLOYEE":
        router.push("/dashboard/profile");
        break;

      case "PROFESSOR":
        router.push("/dashboard/profile");
        break;

      default:
        router.push("/");
    }
  };

  return (
    <main className="h-screen w-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-zinc-900/95 backdrop-blur-sm border border-zinc-800 rounded-3xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">

        <div className="text-center mb-10">
          <Link
            href="/"
            className="text-4xl font-extrabold tracking-tight"
          >
            Club<span className="text-green-500">360</span>
          </Link>

          <h1 className="text-3xl font-bold mt-7 tracking-tight">
            Iniciar sesión
          </h1>

          <p className="text-zinc-400 mt-3 text-sm">
            Ingresá para continuar
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-3.5 outline-none transition-all duration-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-3.5 outline-none transition-all duration-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
          />

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-500 active:scale-[0.98] transition-all duration-300 py-3.5 rounded-2xl font-semibold shadow-lg shadow-green-600/20"
          >
            Ingresar
          </button>

        </form>

        <p className="text-center text-zinc-400 mt-7 text-sm">
          ¿No tenés cuenta?{" "}
          <Link
            href="/register"
            className="text-green-500 hover:text-green-400 hover:underline font-medium transition"
          >
            Registrate
          </Link>
        </p>

      </div>

    </main>
  );
}