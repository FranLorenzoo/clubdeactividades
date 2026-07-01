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
      <div className="relative z-10 mx-auto mt-12 w-full max-w-6xl rounded-3xl border border-zinc-800 bg-zinc-900/95 p-5 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:mb-6">
          <h2 className="text-2xl font-bold text-white">Búsqueda de profesores</h2>
          <p className="text-sm text-zinc-400">
            Buscá por DNI o email, o creá un nuevo profesor desde este panel.
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
            onClick={() => setOpenProfessor(true)}
            className="whitespace-nowrap rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-3 text-sm font-semibold text-green-300 transition hover:bg-green-500/20"
          >
            Crear profesor
          </button>
        </div>
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

      <div className="mx-auto mt-8 w-full max-w-6xl px-4 sm:px-6 lg:px-0">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl shadow-black/20">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-white">Lista de profesores</h3>
              <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-300">
                Activos
              </span>
            </div>

            {loadingProfessors ? (
              <p className="text-zinc-400">Cargando profesores...</p>
            ) : filteredProfessors.filter(p => !p.user.isDeleted).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 p-6 text-center text-zinc-500">
                No se encontraron profesores.
              </div>
            ) : (
              <ul className="space-y-3">
                {filteredProfessors
                  .filter((pro) => !pro.user.isDeleted)
                  .map((pro) => (
                    <li key={pro.id} className="w-full rounded-2xl border border-zinc-700 bg-zinc-800/80 px-4 py-4 shadow-lg shadow-black/10 transition hover:border-green-500/60">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Nombre</p>
                          <p className="text-sm font-semibold text-zinc-100">
                            {pro.user.name} {pro.user.lastName}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">DNI</p>
                          <p className="text-sm font-semibold text-zinc-100">
                            {pro.user.dni}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Actividad</p>
                          <p className="text-sm font-semibold text-zinc-100">
                            {pro.activity?.name ?? "Sin actividad"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Email</p>
                          <p className="break-words text-sm font-semibold text-zinc-100">
                            {pro.user.email}
                          </p>
                        </div>

                        <button
                          onClick={() => deleteProfessor(pro.id)}
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
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl shadow-black/20">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-white">Profesores eliminados</h3>
              <span className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-400">
                Archivados
              </span>
            </div>

            {filteredProfessorsDeleted.filter(p => p.user.isDeleted).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 p-6 text-center text-zinc-500">
                No se encontraron profesores.
              </div>
            ) : (
              <ul className="space-y-3">
                {filteredProfessorsDeleted
                  .filter((pro) => pro.user.isDeleted)
                  .map((pro) => (
                    <li key={pro.id} className="w-full rounded-2xl border border-zinc-700 bg-zinc-800/80 px-4 py-4 shadow-lg shadow-black/10">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Nombre</p>
                          <p className="text-sm font-semibold text-zinc-100">
                            {pro.user.name} {pro.user.lastName}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">DNI</p>
                          <p className="text-sm font-semibold text-zinc-100">
                            {pro.user.dni}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Actividad</p>
                          <p className="text-sm font-semibold text-zinc-100">
                            {pro.activity?.name ?? "Sin actividad"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Email</p>
                          <p className="break-words text-sm font-semibold text-zinc-100">
                            {pro.user.email}
                          </p>
                        </div>

                        <button
                          onClick={() => restoreProfessor(pro.id)}
                          className="mt-1 w-full rounded-2xl border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm font-semibold text-green-300 transition hover:bg-green-500/20 sm:col-span-2"
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