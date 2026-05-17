import { FormEvent, useState } from "react";
import crypto from "crypto";

const generateRandomPassword = () => {
  return crypto.randomBytes(5).toString("hex");
};

const today = new Date();
today.setFullYear(
  today.getFullYear() - 18
);
const maxDate =
  today.toISOString().split("T")[0];

export default function Searchbar() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dni, setDni] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");

  async function handleCreateClient(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const age = 20;

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
            age,
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
          onClick={() => setOpen(true)}
          className="gap-3 bg-[#316788] text-white px-5 py-2 rounded-xl whitespace-nowrap hover:opacity-90 transition"
        >
          Crear cliente
        </button>

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
                bg-white
                w-full
                max-w-lg
                rounded-2xl
                p-8
                shadow-xl
              "
            >

              <div className="flex justify-between items-center mb-6">

                <h2 className="text-2xl font-bold text-black">
                  Crear cliente
                </h2>

                <button
                  onClick={() => setOpen(false)}
                  className="
                    text-zinc-500
                    hover:text-black
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
                    className="
                      border
                      rounded-xl
                      p-4
                      w-1/2
                    "
                  />

                  <input
                    type="text"
                    name="lastName"
                    placeholder="Apellido"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className="
                      border
                      rounded-xl
                      p-4
                      w-1/2
                    "
                  />
              </div>

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="
                    w-full
                    border
                    rounded-xl
                    p-4
                  "
                />

                <input
                  type="text"
                  name="dni"
                  placeholder="DNI"
                  value={dni}
                  onChange={(event) => setDni(event.target.value)}
                  className="
                    w-full
                    border
                    rounded-xl
                    p-4
                  "
                />

                <input
                  type="date"
                  name="fechaNacimiento"
                  max={maxDate}
                  placeholder="Fecha de nacimiento (YYYY-MM-DD)"
                  value={fechaNacimiento}
                  onChange={(event) => setFechaNacimiento(event.target.value)}
                  className="
                    w-full
                    border
                    rounded-xl
                    p-4
                  "
                />

                <button
                  type="submit"
                  disabled={!name || !lastName || !email || !dni || !fechaNacimiento}
                  className="
                    w-full
                    bg-[#316788]
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
                  Crear cliente
                </button>

              </form>

            </div>

          </div>
        )
      }

    </>
  );
}