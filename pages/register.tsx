import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";

export default function Register() {
  const [email, setEmail] = useState("");
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, dni, password }),
    });

    const data = await res.json();

    if (res.ok) {
        router.push("/login");
    } else {
      alert(data.message);
    }
  };

  return (
    <main className="min-h-screen grid md:grid-cols-2">
      <section className="hidden md:flex bg-green-700 text-white items-center justify-center p-12">
        <div>
          <h1 className="text-5xl font-bold mb-6">Sumate Hoy</h1>
          <p className="text-xl text-green-100">
            Creá tu cuenta y empezá a reservar.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center bg-zinc-100 px-6">
        <div className="bg-white w-full max-w-md p-10 rounded-2xl shadow-xl">

          <h2 className="text-3xl font-bold text-center mb-6">
            Registrarse
          </h2>

          <form onSubmit={handleRegister} className="space-y-4">

            <input
              type="email"
              placeholder="Correo electrónico"
              className="w-full border p-3 rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="text"
              placeholder="DNI"
              className="w-full border p-3 rounded-lg"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
            />

            <input
              type="password"
              placeholder="Contraseña"
              className="w-full border p-3 rounded-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="w-full bg-green-600 text-white py-3 rounded-lg">
              Crear cuenta
            </button>

          </form>

          <p className="text-center mt-6 text-sm">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-blue-600">
              Iniciar sesión
            </Link>
          </p>

        </div>
      </section>
    </main>
  );
}