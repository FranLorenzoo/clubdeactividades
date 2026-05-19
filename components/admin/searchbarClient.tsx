import { FormEvent, useState } from "react";
import { calculateAge, generateRandomPassword, getMaxDate } from "@/lib/utils/helpers";
import CreateClient from "./Modal/CreateClient";

type Client = {
  id: number;
 active: boolean;
 suspended: boolean;
 user: {
  name: string;
  lastName: string;
  email: string;
  age: number;
 }
}

export default function Searchbar() {
  const [ client, setClient ] = useState<Client | null>(null);
  const [open, setOpen] = useState(false);

  async function handleSearchClient(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const value =
      String(formData.get("searchValue") || "").trim();

    try {

      const response = await fetch(`/api/client?dni=${value}`);

      if (response.ok) {
        setClient(await response.json());
        return;
      }

      if (response.status === 404) {
        alert("Cliente no encontrado");
        return;
      }

    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    }
  }

  return (
    <>
      <div className="w-full max-w-xl mx-auto mt-[50px] relative z-10">

        <div className="flex items-center gap-3">

          <form onSubmit={handleSearchClient} className="flex gap-3 flex-1">

            <input
              type="text"
              placeholder="Buscar por DNI"
              name="searchValue"
              className="flex-1 border border-[#F59134] rounded-xl bg-[#18181b] text-[#fdfdfd] px-4 py-2 outline-none focus:ring-2 focus:ring-[#F59134]"
            />

            <button
              type="submit"
              className="bg-[#F59134] text-[#09090b] px-5 py-2 rounded-xl hover:opacity-90 hover:scale-[1.02] cursor-pointer transition"
            >
              Buscar
            </button>

          </form>

          <button
            onClick={() => setOpen(true)}
            className="whitespace-nowrap bg-[#F59134] text-[#09090b] px-5 py-2 rounded-xl hover:opacity-90 hover:scale-[1.02] cursor-pointer transition"
          >
            Crear cliente
          </button>

        </div>

        {
          client && (
            <div className="max-w-xl mx-auto mt-6 bg-white border rounded-2xl shadow-md p-6 w-full">

              <h3 className="text-xl font-bold mb-4">
                Cliente encontrado
              </h3>

              <div className="space-y-2 text-gray-700">

                <p>
                  <span className="font-semibold">
                    Nombre:
                  </span>{" "}
                  {client.user.name}
                </p>

                <p>
                  <span className="font-semibold">
                    Apellido:
                  </span>{" "}
                  {client.user.lastName}
                </p>

                <p>
                  <span className="font-semibold">
                    Email:
                  </span>{" "}
                  {client.user.email}
                </p>

                <p>
                  <span className="font-semibold">
                    Edad:
                  </span>{" "}
                  {client.user.age}
                </p>

                <p>
                  <span className="font-semibold">
                    Estado:
                  </span>{" "}
                  {
                    client.suspended
                      ? "Suspendido"
                      : client.active
                        ? "Activo"
                        : "Inactivo"
                  }
                </p>

              </div>

              <div className="flex flex-wrap gap-3 mt-6">

                <button className="bg-[#316788] text-white px-4 py-2 rounded-xl hover:opacity-90 transition">
                  Ver
                </button>

                <button className="bg-red-600 text-white px-4 py-2 rounded-xl hover:opacity-90 transition">
                  Eliminar
                </button>

              </div>

            </div>
          )
        }

      </div>
      {
        open && (
          <CreateClient
            onClose={() => setOpen(false)}
          />
        )
      }

    </>
  );
}