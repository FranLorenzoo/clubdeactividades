import { FormEvent, useEffect, useState } from "react";
import CreateClient from "./Modal/create-client";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/router";
import { isValidDniQuery, isValidEmailQuery } from "@/lib/utils/helpers";

type Client = {
  id: number;
  suspended: boolean;
  active: boolean;
  user: {
    id: number;
    email: string;
    name: string;
    lastName: string;
    dni: string;
    isDeleted: boolean;
  }
}

type Props = {
  role: "ADMIN" | "EMPLOYEE";
};

export default function SearchBar({ role }: Props) {
  const [open, setOpen] = useState(false);
  const [clientes, setClientes]= useState<Client[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);

  const router = useRouter();


  useEffect (()=>{
    setLoadingUsers(true);
    async function fetchCliente(){
            try {
                const res = await fetch("/api/client"); 
                if (res.ok){
                    const data = await res.json(); 
                    setClientes(data);
                    setFilteredClients(data);
                    console.log(data)
                }
            }catch(err){
                console.error("Error cargando clientes", err); 
            }
            setLoadingUsers(false);
        }
        fetchCliente(); 
    }, []) 


    const deleteClient = async (clientId: number) => {
    try {
      const res= await fetch(`/api/client/${clientId}`, { method: "DELETE" });
      if (res.ok){
        setClientes((prev) => prev.filter((cli) => cli.id !== clientId));
        setFilteredClients((prev) => prev.filter((cli) => cli.id !== clientId));
        toast.success("El cliente fue eliminado con éxito");
      }
      } catch (error) {
      console.error("Error eliminando cliente:", error);
      toast.error("Error inesperado al eliminar cliente");
    }
  };

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = String(formData.get("searchValue")).trim();
    let results: Client[] = clientes;
    if (isValidEmailQuery(searchValue)) {
      const normalizedEmail = searchValue.toLowerCase();
      results = clientes.filter(
        (client) => client.user.email.toLowerCase() === normalizedEmail
      );
    } else if (isValidDniQuery(searchValue)) {
      results = clientes.filter((client) => client.user.dni === searchValue);
    } else {
      toast.error("Ingrese un DNI mayor a 7 caracteres o un Email válido");
    }
    setFilteredClients(results);
  }

  return ( <>
      <div className="relative z-10 mx-auto mt-12 w-full max-w-6xl rounded-3xl border border-zinc-800 bg-zinc-900/95 p-5 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:mb-6">
          <h2 className="text-2xl font-bold text-white">Búsqueda de clientes</h2>
          <p className="text-sm text-zinc-400">
            Buscá por DNI o email, o creá un nuevo cliente desde este panel.
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
            onClick={() => setOpen(true)}
            className="whitespace-nowrap rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-3 text-sm font-semibold text-green-300 transition hover:bg-green-500/20"
          >
            Crear cliente
          </button>
        </div>
      </div>

      {
        open && (
          <CreateClient
            onClose={() => setOpen(false)}
            onClientCreated={(newClient) => {
              setClientes((prev) => [...prev, newClient]);
              setFilteredClients((prev) => [...prev, newClient]);
              setOpen(true);
            }}
          />
        )
      }

      <div className="mx-auto mt-8 w-full max-w-6xl px-4 sm:px-6 lg:px-0">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl shadow-black/20">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-white">Lista de clientes</h3>
            <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-300">
              Activos
            </span>
          </div>

          {loadingUsers ? (
            <p className="text-zinc-400">Cargando clientes...</p>
          ) : filteredClients.filter(clie => !clie.user.isDeleted).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 p-6 text-center text-zinc-500">
              No se encontraron clientes.
            </div>
          ) : (
            <ul className="space-y-3">
              {filteredClients.filter(clie => !clie.user.isDeleted).map((cli) => (
                <li
                  key={cli.id}
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-800/80 px-4 py-4 shadow-lg shadow-black/10 transition hover:border-green-500/60"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Nombre</p>
                      <p className="text-sm font-semibold text-zinc-100">{cli.user?.name} {cli.user?.lastName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Email</p>
                      <p className="break-words text-sm font-semibold text-zinc-100">{cli.user?.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Estado</p>
                      <p className={cli.suspended ? "text-sm font-bold text-red-400" : "text-sm font-bold text-green-400"}>
                        {cli.suspended ? "Suspendido" : "Activo"}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row">
                      <Link
                        href={`/dashboard/client-profile/${cli.id}?from=${role.toLowerCase()}`}
                        className="inline-flex items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20"
                      >
                        Ver perfil
                      </Link>

                      <button
                        onClick={() => deleteClient(cli.id)}
                        className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}