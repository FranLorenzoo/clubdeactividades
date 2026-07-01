import { FormEvent, useState, useEffect } from "react";
import CreateEmployee from "./Modal/create-employee";
import toast from "react-hot-toast";
import { isValidDniQuery, isValidEmailQuery } from "@/lib/utils/helpers";

type Employee = {
  id: number,
  user: {
    name: string;
    lastName: string;
    email: string;
    dni: string;
    id: number;
    isDeleted: boolean;
  }
}

export default function Searchbar() {
  const [openEmployee, setOpenEmployee] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  
  useEffect(() => {
    setLoadingEmployees(true);
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
      setLoadingEmployees(false);
    }
    fetchEmployees();
  }, []);


  const deleteEmployee = async (idUno: number) => {
    try {
      const res= await fetch(`/api/employee/${idUno}`, { method: "DELETE" });
      if (res.ok){
        setEmployees((prev) => prev.filter((emp) => emp.id !== idUno));
        setFilteredEmployees((prev) => prev.filter((pro) => pro.id !== idUno));
        toast.success("El empleado fue eliminado con éxito");
      }
    } catch (error) {
      console.error("Error eliminando empleado:", error);
      toast.error("Error inesperado al eliminar empleado");
    }
  };

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = String(formData.get("searchValue")).trim();
    let results: Employee[] = employees;
    if (isValidEmailQuery(searchValue)) {
      const normalizedEmail = searchValue.toLowerCase();
      results = employees.filter(
        (employee) => employee.user.email.toLowerCase() === normalizedEmail
      );
    } else if (isValidDniQuery(searchValue)) {
      results = employees.filter((client) => client.user.dni === searchValue);
    } else {
      toast.error("Ingrese un DNI mayor a 7 caracteres o un Email válido");
    }
    setFilteredEmployees(results);
  }

  return ( <>
      <div className="relative z-10 mx-auto mt-12 w-full max-w-6xl rounded-3xl border border-zinc-800 bg-zinc-900/95 p-5 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:mb-6">
          <h2 className="text-2xl font-bold text-white">Búsqueda de empleados</h2>
          <p className="text-sm text-zinc-400">
            Buscá por DNI o email, o creá un nuevo empleado desde este panel.
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <form className="flex w-full flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Buscar por DNI o Email"
              name="searchValue"
              className="w-full flex-1 rounded-2xl border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
            />
            <button className="whitespace-nowrap rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700">
              Buscar
            </button>
          </form>

          <button
            onClick={() => setOpenEmployee(true)}
            className="whitespace-nowrap rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-3 text-sm font-semibold text-green-300 transition hover:bg-green-500/20"
          >
            Crear empleado
          </button>
        </div>
      </div>

      {
        openEmployee && (
          <CreateEmployee
            onClose={() => setOpenEmployee(false)}
            onEmployeeCreated={(newEmployee) => {
              setEmployees((prev) => [...prev, newEmployee]);
              setFilteredEmployees((prev) => [...prev, newEmployee]);
              setOpenEmployee(true);
            }}
          />
        )
      }

      <div className="mx-auto mt-8 w-full max-w-6xl px-4 sm:px-6 lg:px-0">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl shadow-black/20">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-white">Lista de empleados</h3>
            <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-300">
              Activos
            </span>
          </div>

          {loadingEmployees ? (
            <p className="text-zinc-400">Cargando empleados...</p>
          ) : filteredEmployees.filter(emp => !emp.user.isDeleted).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 p-6 text-center text-zinc-500">
              No se encontraron empleados.
            </div>
          ) : (
            <ul className="space-y-3">
              {filteredEmployees.filter(emp => !emp.user.isDeleted).map((emp) => (
                <li
                  key={emp.id}
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-800/80 px-4 py-4 shadow-lg shadow-black/10 transition hover:border-green-500/60"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Nombre</p>
                      <p className="text-sm font-semibold text-zinc-100">{emp.user?.name} {emp.user?.lastName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">DNI</p>
                      <p className="text-sm font-semibold text-zinc-100">{emp.user?.dni}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Email</p>
                      <p className="break-words text-sm font-semibold text-zinc-100">{emp.user?.email}</p>
                    </div>

                    <button
                      onClick={() => deleteEmployee(emp.id)}
                      className="mt-1 w-full rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 sm:col-span-2"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
);}