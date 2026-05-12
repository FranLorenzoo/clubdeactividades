import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

interface Person {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol?: "empleado" | "profesor" | "";
}

const personaPorDefecto: Person = {
  id: "1",
  nombre: "María",
  apellido: "Pérez",
  email: "maria.perez@example.com",
  telefono: "123456789",
  rol: "",
};

export default function EmployeesPage() {
  const router = useRouter();
  const [persona, setPersona] = useState<Person | null>(null);
  const [rolSeleccionado, setRolSeleccionado] = useState<"empleado" | "profesor" | "">("");

  useEffect(() => {
    const { id, nombre, apellido, email, telefono } = router.query;

    if (id && nombre && apellido && email && telefono) {
      setPersona({
        id: String(id),
        nombre: String(nombre),
        apellido: String(apellido),
        email: String(email),
        telefono: String(telefono),
        rol: "",
      });
      setRolSeleccionado("");
      return;
    }

    setPersona(personaPorDefecto);
  }, [router.query]);

  const asignarRol = (rol: "empleado" | "profesor") => {
    if (!persona) return;
    setRolSeleccionado(rol);
    setPersona({ ...persona, rol });
  };

  const saveRole = async () => {
    if (!persona || !rolSeleccionado) return;
    try {
      const response = await fetch(`/api/`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: persona.id, rol: rolSeleccionado }),
      });
      const data = await response.json();
      console.log(data)
      if (response.ok) {
        alert('Rol asignado exitosamente');
      } else {
        alert('Error al asignar rol');
      }
    } catch (error) {
      alert('Error de red');
    }
  };

  return (
    <main className=" p-6 font-sans max-w-wl min-h-screen  bg-[#FEFEFE] rounded-lg">
      <div className="text-2xl justify-left flex mb-4 font-bold flex-col ">
        <h1 className=" mb-6 leading-tight tracking-wide border-b border-zinc-800 max-w-wl ">
          Club<span className="text-[#5A8949]">360</span>
        </h1>
        <Link
          href="/"
          className="text-lg font-semibold flex justify-left"
        >
          Volver atrás
        </Link>
      </div>
      <h1 className="flex text-3xl font-bold mb-4 justify-center">Asignar rol</h1>
      <p className="flex justify-center mb-4 ">Revisa los datos de la persona seleccionada y elige el rol que se le asignará.</p>
      
      <section className="flex justify-center border border-gray-300 rounded-lg p-5 shadow-md">
        {persona ? (
          <section className="border border-gray-300 rounded-lg p-5 mt-5">
            <h2 className="text-xl font-semibold mb-3">Datos de la persona</h2>
            <div className="grid gap-2.5 mt-3">
              <div className="font-medium">
                <strong>Nombre:</strong> {persona.nombre}
              </div>
              <div className="font-medium">
                <strong>Apellido:</strong> {persona.apellido}
              </div>
              <div className="font-medium">
                <strong>Email:</strong> {persona.email}
              </div>
              <div className="font-medium">
                <strong>Teléfono:</strong> {persona.telefono}
              </div>
              <div className="font-medium">
                <strong>Rol actual:</strong> {rolSeleccionado || "Sin rol asignado"}
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-2">Selecciona un rol:</p>
              <div className="flex gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => asignarRol("empleado")}
                  className={`px-4 py-3 rounded-md border border-blue-500 transition ${
                    rolSeleccionado === "empleado"
                      ? "bg-[#316788] text-white"
                      : "bg-white text-[#316788]"
                  } cursor-pointer`}
                >
                  Asignar rol de empleado
                </button>
                <button className="w-full p-5 rounded-2xl border border-zinc-700 hover:border-[#5A8949] hover:bg-zinc-800 transition duration-300 text-left">

                <p className="text-lg font-semibold">
                  Profesor
                </p>

              </button>

                <button
                  type="button"
                  onClick={saveRole}
                  disabled={!rolSeleccionado}
                  className={`px-4 py-3 rounded-md border border-blue-500 ${
                    rolSeleccionado
                      ? "bg-[#316788] text-white cursor-pointer"
                      : "bg-gray-300 text-white cursor-not-allowed"
                  }`}
                >
                  Guardar
                </button>
              </div>
            </div>
          </section>
        ) : (
          <p>No se ha seleccionado ninguna persona.</p>
        )}
      </section>
    </main>
  );
}