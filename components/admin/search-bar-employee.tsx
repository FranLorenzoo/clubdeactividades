import { FormEvent, useState, useEffect } from "react";
import CreateEmployee from "./Modal/create-employee";

export default function Searchbar() {
  const [openEmployee, setOpenEmployee] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  
  useEffect(() => {
    async function fetchEmployees() {
      try {
        const res = await fetch("/api/employee");
        if (res.ok) {
          const data = await res.json();
          setEmployees(data);
        }
      } catch (err) {
        console.error("Error cargando empleados", err);
      }
    }
    fetchEmployees();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const value =
      String(formData.get("searchValue") || "").trim();

    try {

      const response =
        await fetch(`/api/user?dni=${value}`);

      if (response.ok) {

        const user = await response.json();

        window.location.href =
          `/user/${user.id}`;

        return;
      }

      if (response.status === 404) {

        alert("Empleado no encontrado");

        return;
      }

      const errorData = await response.json();

      alert(
        errorData.message ||
        "Error inesperado"
      );

    } catch (error) {

      console.error(error);

      alert("Error de conexión");
    }
  }

  return ( <>
      <div className="flex items-center gap-3 w-full max-w-xl mx-auto mt-[50px] relative z-10">

        <form
          onSubmit={handleSubmit}
          className="flex gap-3"
        >

          <input
            type="text"
            placeholder="Buscar por DNI"
            name="searchValue"
            className="
              flex-1
              border
              border-gray-300
              rounded-xl
              px-4
              py-2
              outline-none
              focus:ring-2
              focus:ring-[#316788]
            "
          />

          <button
            type="submit"
            className="
              bg-[#316788]
              text-white
              px-5
              py-2
              rounded-xl
              hover:opacity-90
              transition
            "
          >
            Buscar
          </button>

        </form>

        <button
          onClick={() => setOpenEmployee(true)}
          className="gap-3 bg-[#316788] text-white px-5 py-2 rounded-xl whitespace-nowrap hover:opacity-90 transition">
          Crear empleado
        </button>

      </div>

      {
        openEmployee && (
          <CreateEmployee
            onClose={() => setOpenEmployee(false)}
          />
        )
      }

      <div className="mt-6 max-w-xl mx-auto">
  <h3 className="text-lg font-bold mb-3">Lista de empleados</h3>
  <ul className="space-y-2">
    {employees.map((emp) => (
      <li
        key={emp.id}
        className="border rounded-lg px-4 py-3 bg-white shadow-sm"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-600">Nombre</p>
            <p>{emp.user?.name} {emp.user?.lastName}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">DNI</p>
            <p>{emp.user?.dni}</p>
          </div>
        </div>
      </li>
    ))}
  </ul>
</div>


    </>
  );
}