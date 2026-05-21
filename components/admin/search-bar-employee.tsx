import { FormEvent, useState, useEffect, ChangeEvent } from "react";
import CreateEmployee from "./Modal/create-employee";

type Employee = {
  id: number,
  user: {
    name: string;
    lastName: string;
    email: string;
    dni: string;
    id: number;
  }
}

export default function Searchbar() {
  const [openEmployee, setOpenEmployee] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  
  useEffect(() => {
    async function fetchEmployees() {
      try {
        const res = await fetch("/api/employee");
        if (res.ok) {
          const data = await res.json();
          setEmployees(data);
          setFilteredEmployees(data);
        }
      } catch (err) {
        console.error("Error cargando empleados", err);
      }
    }
    fetchEmployees();
  }, []);


  const deleteEmployee = async (idUno: number, idDos: number) => {
    try {
      const res= await fetch(`/api/employee/${idUno}`, { method: "DELETE" });
      await fetch(`/api/user/${idDos}`, { method: "DELETE" });
      if (res.ok){
        setEmployees((prev) => prev.filter((emp) => emp.id !== idUno));
        setFilteredEmployees((prev) => prev.filter((pro) => pro.id !== idUno));
        alert("El empleado fue eliminado con éxito");
      }
    } catch (error) {
      console.error("Error eliminando empleado:", error);
      alert("Error inesperado al eliminar empleado");
    }
  };

  function handleSearch(e: ChangeEvent<HTMLInputElement>) {
    const searchValue = e.target.value;
    const filteredEmployees = employees.filter(employee => 
      employee.user.dni.includes(searchValue)
      || employee.user.email.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())
    );
    setFilteredEmployees(filteredEmployees);
  }

  return ( <>
      <div className="flex items-center gap-3 w-full max-w-xl mx-auto mt-[50px] relative z-10">

        <form
          className="flex gap-3"
        >

          <input
            type="text"
            placeholder="Buscar por DNI"
            name="searchValue"
            onChange={handleSearch}
            className="
              flex-1
              border
              border-gray-300
              rounded-xl
              px-4
              py-2
              outline-none
              focus:ring-2
              focus:ring-green-600
            "
          />
        </form>

        <button
          onClick={() => setOpenEmployee(true)}
          className="gap-3 bg-green-600 text-white px-5 py-2 rounded-xl whitespace-nowrap hover:opacity-90 transition">
          Crear empleado
        </button>

      </div>

      {
        openEmployee && (
          <CreateEmployee
            onClose={() => setOpenEmployee(false)}
            onEmployeeCreated={(newEmployee) => {
              setEmployees((prev) => [...prev, newEmployee]);
              setFilteredEmployees((prev) => [...prev, newEmployee]);
              setOpenEmployee(false);
            }}
          />
        )
      }

      <div className="mt-6 max-w-xl mx-auto">
  <h3 className="text-lg font-bold mb-3">Lista de empleados</h3>
  <ul className="space-y-2">
    {filteredEmployees.map((emp) => (
      <li
        key={emp.id}
        className="border rounded-lg px-4 py-3 bg-white shadow-sm"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-600">Nombre</p>
            <p className="text-gray-700 text-sm font-semibold">{emp.user?.name} {emp.user?.lastName}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">DNI</p>
            <p className="text-gray-700 text-sm font-semibold">{emp.user?.dni}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Email</p>
            <p className="text-gray-700 text-sm font-semibold">{emp.user?.email}</p>
          </div>
        </div>
        <button onClick={() => deleteEmployee(emp.id, emp.user?.id)} 
          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm font-semibold">
          Eliminar</button>

      </li>
    ))}
  </ul>
</div>


    </>
  );
}