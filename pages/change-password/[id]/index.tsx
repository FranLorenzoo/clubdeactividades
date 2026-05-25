"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

export default function ChangePassword() {
  const router = useRouter();
  const { id } = router.query;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  async function HandleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (password.length <= 8){
      toast.error("La contraseña debe tener al menos 8 caracteres")
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

     try {

    const response = await fetch(`/api/user/${id}`,{
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
        }),
      }
    );

    if (response.ok) {

      toast.success(
        "Contraseña actualizada correctamente"
      );

      router.push("/login");

    } else {

      toast.error("Ocurrió un error");
    }

  } catch (error) {

    console.error(error);

    toast.error("Error del servidor");
  }
  }


  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Cambiar contraseña
          </h1>

          <p className="text-gray-500 mt-3 text-sm">
            Ingresá una nueva contraseña para tu cuenta.
          </p>
        </div>

        <form
          onSubmit={HandleChangePassword} 
          className="space-y-5">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nueva contraseña
            </label>

            <input
              id="password"
              type="password"
              min={8}
              placeholder="********"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirmar contraseña
            </label>

            <input
              id="confirmPassword"
              type="password"
              min={8}
              placeholder="********"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 transition text-white font-semibold py-3 rounded-xl"
          >
            Guardar contraseña
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Club360 • Sistema de gestión de actividades
          </p>
        </div>
      </div>
    </div>
  );
}