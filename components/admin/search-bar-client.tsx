import { FormEvent, useEffect, useState } from "react";
import crypto from "crypto";
import CreateClient from "./Modal/create-client";

const generateRandomPassword = () => {
  return crypto.randomBytes(5).toString("hex");
};

const today = new Date();
today.setFullYear(
  today.getFullYear() - 18
);
const maxDate = today.toISOString().split("T")[0];




function calculateAge(fechaNacimiento: string
) {
  const today = new Date();
  const birth = new Date(fechaNacimiento);
  let age = today.getFullYear() - birth.getFullYear();

  const monthDifference =
    today.getMonth() -
    birth.getMonth();

  if (
    monthDifference < 0 ||
    (
      monthDifference === 0 &&
      today.getDate() < birth.getDate()
    )
  ) {
    age--;
  }
  return age;
}



export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [clientes, setClientes]= useState<any[]>([]); 

  useEffect (()=>{
    async function fetchCliente(){
            try {
                const res = await fetch("/api/client"); 
                if (res.ok){
                    const data = await res.json(); 
                    setClientes(data); 
                    console.log(data)
                }
            }catch(err){
                console.error("Error cargando clientes", err); 
            }
        }
        fetchCliente(); 
    }, []) 


    const deleteClient = async (idUno: number, idDos: number) => {
    try {
      const res= await fetch(`/api/client/${idUno}`, { method: "DELETE" });
      await fetch(`/api/user/${idDos}`, { method: "DELETE" });
      if (res.ok){
        setClientes((prev) => prev.filter((cli) => cli.id !== idUno));
        alert("El cliente fue eliminado con éxito");
      }
      } catch (error) {
      console.error("Error eliminando cliente:", error);
      alert("Error inesperado al eliminar cliente");
    }
  };


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

        alert("Cliente no encontrado");

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
              focus:ring-green-600
            "
          />

          <button
            type="submit"
            className="
              bg-green-600
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
          />
        )
      }

      <div className="mt-6 max-w-xl mx-auto">
  <h3 className="text-lg font-bold mb-3">Lista de clientes</h3>
  <ul className="space-y-2">
    {clientes.map((cli) => (
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
</div>


    </>
  );
}