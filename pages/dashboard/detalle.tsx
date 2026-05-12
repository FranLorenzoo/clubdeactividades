import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function EmployeesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>();
  const [rolSeleccionado, setRolSeleccionado] = useState<any>();


  useEffect(() => {
    //if (!router.query.id) return;
    fetch(`/api/user/3`)  // Cambia el 3 por router.query.id 
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setRolSeleccionado(data.rol);
      })
      .catch((err) => console.error("Error fetching user data:", err));
  }, [router.query.id]);

  const asignarRol = (rol: "empleado" | "profesor" | "Cliente") => {
    if (!user) return;
    setRolSeleccionado(rol);
    setUser({ ...user, rol });
  };

  const saveRole = async () => {
    if (!user || !rolSeleccionado) return;

    const employeeData = {
      email: user.email,
      dni: user.dni,
      password: user.password,
      age: user.age,
      suspended: false,
      activityId: 1,
      roleId: rolSeleccionado === "empleado" ? 6 : rolSeleccionado === "profesor" ? 7 : 8,
    };
    try {
      const response = await fetch(`/api/employee`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( employeeData ),
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
    <main className=" p-6 font-sans max-w-wl min-h-screen bg-[#373F4B] ">
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
      <section className="flex justify-center flex-col border max-w-prose mx-auto border-gray-300 bg-white rounded-lg p-5 ">
          <h1 className="flex text-3xl font-bold mb-4 justify-center">Asignar rol</h1>
          <p className="flex justify-center mb-4 text-[#115d8b]">Revisa los datos de la persona seleccionada y elige el rol que se le asignará.</p>
          <section className="border border-gray-300 rounded-lg p-5 mt-5">
            <h2 className="text-xl font-semibold mb-3">Datos del usuario</h2>
            <div className="grid gap-2.5 mt-3">
              <div className="font-medium">
                <strong>Nombre:</strong> {user?.nombre}
              </div>
              <div className="font-medium">
                <strong>Apellido:</strong> {user?.apellido}
              </div>
              <div className="font-medium">
                <strong>Email:</strong> {user?.email}
              </div>
              <div className="font-medium">
                <strong>Rol actual:</strong> {rolSeleccionado || "Sin rol asignado"}
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-2">Selecciona un rol:</p>
              <div className="flex gap-3 flex-col">
                <button
                  type="button"
                  onClick={() => asignarRol("empleado")}
                  className={`px-4 py-3 rounded-md border border-blue-500 transition ${
                    rolSeleccionado === "empleado"
                      ? "bg-[#316788] text-white"
                      : "bg-white text-[#316788]"
                  } cursor-pointer`}
                >
                  <p className="text-lg font-semibold">
                    Asignar rol de Empleado
                  </p>
                </button>

                <button 
                  type="button"
                  onClick={() => asignarRol("profesor")}
                  className={`px-4 py-3 rounded-md border border-blue-500 transition ${
                    rolSeleccionado === "profesor"
                      ? "bg-[#316788] text-white"
                      : "bg-white text-[#316788]"
                  } cursor-pointer`}
                >

                  <p className="text-lg font-semibold">
                    Asignar rol de Profesor
                  </p>
                </button>

                <button 
                  type="button"
                  onClick= {() => asignarRol("Cliente")}
                  className={`px-4 py-3 rounded-md border border-blue-500 transition ${
                    rolSeleccionado === "Cliente"
                      ? "bg-[#316788] text-white"
                      : "bg-white text-[#316788]"
                  } cursor-pointer`}
                >

                  <p className="text-lg font-semibold">
                    Quitar Rol
                  </p>
                </button>

                <button
                  type="button"
                  onClick={saveRole}
                  disabled={!rolSeleccionado}
                  className={`px-4 py-3 rounded-md border border-blue-500 ${
                    rolSeleccionado
                      ? "bg-[#316788] text-white cursor-pointer"
                      : "bg-gray-300 text-white"
                  }`}
                >
                  <p className="text-lg font-semibold">
                    Guardar
                  </p>
                </button>
              </div>
            </div>
          </section>
      </section>
    </main>
  );
}