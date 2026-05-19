import { FormEvent, useState } from "react";
import { calculateAge, generateRandomPassword, getMaxDate } from "@/lib/utils/helpers";

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

const maxDate = getMaxDate();

export default function Searchbar() {
  const [ client, setClient ] = useState<Client | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dni, setDni] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [loading, setLoading] = useState(false);

  function resetForm() {
      setName("");
      setLastName("");
      setEmail("");
      setDni("");
      setFechaNacimiento("");
  }

  async function handleCreateClient(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const response = await fetch(
        "/api/user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            lastName,
            email,
            dni,
            age: calculateAge(fechaNacimiento),
            roleId: "1",
            password: generateRandomPassword(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {

        alert("Cliente creado");

        setOpen(false);
        setName("");
        setLastName("");
        setEmail("");
        setDni("");
        setFechaNacimiento("");

        return;
      }

      alert(
        data.message ||
        "Error al crear cliente"
      );

    } catch (error) {

      console.error(error);

      alert("Error de conexión");
    }
  }

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

          <div
            className="
              fixed
              inset-0
              bg-black/50
              flex
              items-center
              justify-center
              z-50
              p-4
            "
          >

            <div
              className="
                bg-[#1B1E22]
                w-full
                max-w-lg
                rounded-2xl
                p-8
                shadow-xl
              "
            >

              <div className="flex justify-between items-center mb-6">

                <h2 className="text-2xl font-bold text-white">
                  Crear cliente
                </h2>

                <button
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                  className="
                    text-zinc-500
                    hover:text-white
                    text-xl
                  "
                >
                  ✕
                </button>

              </div>

              <form
              onSubmit={handleCreateClient}
              className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="name"
                    placeholder="Nombre"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="bg-zinc-800 border border-zinc-700 text-white rounded-xl p-4 w-1/2 outline-none transition-all duration-300 focus:border-[#F59134] focus:ring-2
                     focus:ring-[#F59134]/20"
                  />

                  <input
                    type="text"
                    name="lastName"
                    placeholder="Apellido"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className="bg-zinc-800 border border-zinc-700 text-white rounded-xl p-4 w-1/2 outline-none transition-all duration-300 focus:border-[#F59134] focus:ring-2
                     focus:ring-[#F59134]/20"
                  />
              </div>

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="bg-zinc-800 border border-zinc-700 text-white rounded-xl p-4 outline-none w-full transition-all duration-300 focus:border-[#F59134] focus:ring-2
                     focus:ring-[#F59134]/20"
                />

                <input
                  type="text"
                  name="dni"
                  placeholder="DNI"
                  value={dni}
                  onChange={(event) => setDni(event.target.value)}
                  className="bg-zinc-800 border border-zinc-700 text-white rounded-xl p-4 outline-none w-full transition-all duration-300 focus:border-[#F59134] focus:ring-2
                     focus:ring-[#F59134]/20"
                />

                <input
                  type="date"
                  name="fechaNacimiento"
                  max={maxDate}
                  placeholder="Fecha de nacimiento (YYYY-MM-DD)"
                  value={fechaNacimiento}
                  onChange={(event) => setFechaNacimiento(event.target.value)}
                  className="bg-zinc-800 border border-zinc-700 text-white rounded-xl p-4 outline-none w-full transition-all duration-300 focus:border-[#F59134] focus:ring-2
                     focus:ring-[#F59134]/20"
                />

                <button
                  type="submit"
                  disabled={!name || !lastName || !email || !dni || !fechaNacimiento}
                  className="
                    w-full
                    bg-[#F59134]
                    text-white
                    py-4
                    rounded-xl
                    font-semibold
                    hover:opacity-90
                    transition
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  {
                      loading
                        ? "Creando cliente..."
                        : "Crear cliente"
                    }
                </button>
              </form>
            </div>
          </div>
        )
      }

    </>
  );
}