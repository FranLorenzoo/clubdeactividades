import { FormEvent, useEffect, useState } from "react";
import CreateProfessor from "./Modal/create-professor";
import toast from "react-hot-toast";
import { isValidDniQuery, isValidEmailQuery } from "@/lib/utils/helpers";

type Professor = {
  id: number;
  user: {
    email: string;
    name: string;
    lastName: string;
    dni: string;
    id: number;
    isDeleted: boolean;
  };
  activity: {
    id: number;
    name: string;
  };
};

export default function SearchBarProfessor() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loadingProfessors, setLoadingProfessors] = useState(true);

  const [openProfessor, setOpenProfessor] = useState(false);

  const [filteredProfessors, setFilteredProfessors] = useState<Professor[]>([]);
  const [professorsDeleted, setProfessorsDeleted] = useState<Professor[]>([]);
  const [filteredProfessorsDeleted, setFilteredProfessorsDeleted] = useState<Professor[]>([]);

  const fetchProfessors = async () => {
    setLoadingProfessors(true);
    try {
      const res = await fetch("/api/professor");
      if (res.ok) {
        const data = await res.json();
        setProfessors(data);
        setFilteredProfessors(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingProfessors(false);
  };

  const fetchDeletedProfessors = async () => {
    try {
      const res = await fetch("/api/professor?deleted=true");
      if (res.ok) {
        const data = await res.json();
        setProfessorsDeleted(data);
        setFilteredProfessorsDeleted(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfessors();
    fetchDeletedProfessors();
  }, []);

  const deleteProfessor = async (id: number) => {
    try {
      const res = await fetch(`/api/professor/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        toast.error("El profesor tiene clases asociadas");
        return;
      }

      toast.success("El profesor fue eliminado con éxito");

      await Promise.all([
        fetchProfessors(),
        fetchDeletedProfessors(),
      ]);
    } catch (error) {
      console.error(error);
      toast.error("Error inesperado al eliminar profesor");
    }
  };

  const restoreProfessor = async (id: number) => {
    try {
      const res = await fetch(`/api/professor/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isDeleted: false,
        }),
      });

      if (!res.ok) {
        toast.error("No se pudo recuperar el profesor");
        return;
      }

      toast.success("Profesor recuperado con éxito");

      await Promise.all([
        fetchProfessors(),
        fetchDeletedProfessors(),
      ]);
    } catch (error) {
      console.error(error);
      toast.error("Error inesperado al recuperar profesor");
    }
  };

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const searchValue = String(formData.get("searchValue")).trim();

    let results: Professor[] = professors;

    if (isValidEmailQuery(searchValue)) {
      const normalized = searchValue.toLowerCase();
      results = professors.filter(
        (p) => p.user.email.toLowerCase() === normalized
      );
    } else if (isValidDniQuery(searchValue)) {
      results = professors.filter(
        (p) => p.user.dni === searchValue
      );
    } else {
      toast.error("Ingrese un DNI válido o Email válido");
    }

    setFilteredProfessors(results);
  }

  return (
    <>
      <div className="flex items-center gap-3 w-full max-w-xl mx-auto mt-[50px] relative z-10">

        <form className="flex gap-3" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Buscar por DNI o Email"
            name="searchValue"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-green-600"
          />
          <button className="gap-3 bg-green-600 text-white px-5 py-2 rounded-xl whitespace-nowrap hover:opacity-90 transition">
            Buscar
          </button>
        </form>

        <button
          onClick={() => setOpenProfessor(true)}
          className="gap-3 bg-green-600 text-white px-5 py-2 rounded-xl whitespace-nowrap hover:opacity-90 transition"
        >
          Crear profesor
        </button>
      </div>

      {openProfessor && (
        <CreateProfessor
          onClose={() => setOpenProfessor(false)}
          onProfessorCreated={(newProfessor) => {
            setProfessors((prev) => [...prev, newProfessor]);
            setFilteredProfessors((prev) => [...prev, newProfessor]);
          }}
        />
      )}

      <div className="mt-6 w-full max-w-screen-2xl mx-auto px-6">
        <div className="grid grid-cols-2 gap-8 divide-x divide-gray-300">
          <div className="pr-6">
            <h3 className="text-lg font-bold mb-3">Lista de profesores</h3>

            {loadingProfessors ? (
              <p className="text-gray-500">Cargando profesores...</p>
            ) : filteredProfessors.filter(p => !p.user.isDeleted).length === 0 ? (
              <p className="text-gray-500">No se encontraron profesores.</p>
            ) : (
              <ul className="space-y-2">
                {filteredProfessors
                  .filter((pro) => !pro.user.isDeleted)
                  .map((pro) => (
                    <li key={pro.id} className="border rounded-lg px-4 py-3 bg-white shadow-sm w-full">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-600">Nombre</p>
                          <p className="text-gray-700 text-sm font-semibold">
                            {pro.user.name} {pro.user.lastName}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-gray-600">DNI</p>
                          <p className="text-gray-700 text-sm font-semibold">
                            {pro.user.dni}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-gray-600">Actividad</p>
                          <p className="text-gray-700 text-sm font-semibold">
                            {pro.activity?.name ?? "Sin actividad"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-gray-600">Email</p>
                          <p className="text-gray-700 text-sm font-semibold break-words">
                            {pro.user.email}
                          </p>
                        </div>

                        <button
                          onClick={() => deleteProfessor(pro.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm font-semibold"
                        >
                          Eliminar
                        </button>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>
          <div className="pl-6">
            <h3 className="text-lg font-bold mb-3">Profesores eliminados</h3>

            {filteredProfessorsDeleted.filter(p => p.user.isDeleted).length === 0 ? (
              <p className="text-gray-500">No se encontraron profesores.</p>
            ) : (
              <ul className="space-y-2">
                {filteredProfessorsDeleted
                  .filter((pro) => pro.user.isDeleted)
                  .map((pro) => (
                    <li key={pro.id} className="border rounded-lg px-4 py-3 bg-white shadow-sm w-full">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-600">Nombre</p>
                          <p className="text-gray-700 text-sm font-semibold">
                            {pro.user.name} {pro.user.lastName}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-gray-600">DNI</p>
                          <p className="text-gray-700 text-sm font-semibold">
                            {pro.user.dni}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-gray-600">Actividad</p>
                          <p className="text-gray-700 text-sm font-semibold">
                            {pro.activity?.name ?? "Sin actividad"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-gray-600">Email</p>
                          <p className="text-gray-700 text-sm font-semibold break-words">
                            {pro.user.email}
                          </p>
                        </div>

                        <button
                          onClick={() => restoreProfessor(pro.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm font-semibold"
                        >
                          Recuperar profesor
                        </button>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>

        </div>
      </div>
    </>
  );
}