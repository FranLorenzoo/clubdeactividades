import { FormEvent, useEffect, useState } from "react";
import CreateClient from "./Modal/create-client";

type Client = {
  id: number;
  suspended: boolean;
  active: boolean;
  user: {
    id: number,
    email: string,
    name: string,
    lastName: string,
    dni: string
  }
}

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [clientes, setClientes]= useState<Client[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);

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


    const deleteClient = async (idUno: number, idDos: number) => {
    try {
      const res= await fetch(`/api/client/${idUno}`, { method: "DELETE" });
      await fetch(`/api/user/${idDos}`, { method: "DELETE" });
      if (res.ok){
        setClientes((prev) => prev.filter((cli) => cli.id !== idUno));
        setFilteredClients((prev) => prev.filter((cli) => cli.id !== idUno));
        alert("El cliente fue eliminado con éxito");
      }
      } catch (error) {
      console.error("Error eliminando cliente:", error);
      alert("Error inesperado al eliminar cliente");
    }
  };

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = String(formData.get("searchValue"));
    const filteredClients = clientes.filter(client => 
      client.user.dni.includes(searchValue)
      || client.user.email.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredClients(filteredClients);
  }

  return ( <>
      <div className="flex items-center gap-3 w-full max-w-xl mx-auto mt-[50px] relative z-10">

        <form
          className="flex gap-3"
          onSubmit={handleSearch}
        >

          <input
            type="text"
            placeholder="Buscar por DNI o Email"
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
              focus:ring-green-600
            "
          />

          <button
            className="gap-3 bg-green-600 text-white px-5 py-2 rounded-xl whitespace-nowrap hover:opacity-90 transition"
          >
            Buscar
          </button>

        </form>

        <button
          onClick={() => setOpen(true)}
          className="gap-3 bg-green-600 text-white px-5 py-2 rounded-xl whitespace-nowrap hover:opacity-90 transition"
        >
          Crear cliente
        </button>

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

      <div className="mt-6 max-w-xl mx-auto">
        <h3 className="text-lg font-bold mb-3">Lista de clientes</h3>
        {loadingUsers ? (
          <p className="text-gray-500">Cargando clientes...</p>
        ) : filteredClients.length === 0 ? (
          <p className="text-gray-500">No se encontraron clientes</p>
        ) : (
          <ul className="space-y-2">
            {filteredClients.map((cli) => (
              <li
                key={cli.id}
                className="border rounded-lg px-4 py-3 bg-white shadow-sm"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Nombre</p>
                  <p className="text-gray-700 text-sm font-semibold">{cli.user?.name} {cli.user?.lastName}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">DNI</p>
                  <p className="text-gray-700 text-sm font-semibold">{cli.user?.dni}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Email</p>
                  <p className="text-gray-700 text-sm font-semibold">{cli.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Estado</p>
                  <p className={cli.suspended ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                    {cli.suspended ? "Suspendido" : "Activo"}
                  </p>
                </div>
              </div>
              <button onClick={() => deleteClient(cli.id, cli.user?.id)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm font-semibold">
                Eliminar
              </button>
            </li>
            ))}
            </ul>
          )}
      </div>
    </>
  );
}