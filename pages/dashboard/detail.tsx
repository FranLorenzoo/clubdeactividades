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
    <main className="min-h-screen bg-zinc-950 text-white">

      <header className="border-b border-zinc-800 mb-6">

        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center">

          <h1 className="text-2xl font-bold tracking-wide">
            Club<span className="text-[#5A8949]">360</span>
          </h1>

        </div>

      </header>

      <section className="flex justify-center flex-col border max-w-prose mx-auto border-gray-300 bg-white rounded-lg p-5 text-black">
          <h1 className="flex text-3xl font-bold mb-4 justify-center">Datos del Cliente</h1>
          <section className="border border-gray-300 rounded-lg p-5 mt-5">
            <div className="grid gap-2.5 mt-3">
              <div className="font-medium">
                <strong>Nombre:</strong> {user?.nombre}
              </div>
              <div className="font-medium">
                <strong>Apellido:</strong> {user?.apellido}
              </div>
              <div className="font-medium">
                <strong>DNI:</strong> {user?.dni}
              </div>
              <div className="font-medium">
                <strong>Edad:</strong> {user?.age}
              </div>
              <div className="font-medium">
                <strong>Email:</strong> {user?.email}
              </div>
            </div>
            <div className="mt-6">
              <h2 className="mb-2">Lista de Reservas:</h2>
              
            </div>
          </section>
      </section>
    </main>
  );
}