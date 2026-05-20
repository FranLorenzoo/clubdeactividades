import {useState } from "react";
import { useEffect } from "react";
import { calculateAge, getMaxDate, generateRandomPassword } from "@/lib/utils/helpers";

type Props = {
  onClose: () => void;
};
const maxDate = getMaxDate();

export default function CreateClient({onClose}: Props) {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dni, setDni] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function resetForm() {
      setName("");
      setLastName("");
      setEmail("");
      setDni("");
      setFechaNacimiento("");
  }
  useEffect(() => {
      fetch('/api/activity')
      .then(res => res.json())
      .then(actData => {
      })
      .catch(error => {
        console.error(error)
        alert("Error al cargar actividades")
      });
      }, [])

  async function handleCreateClient(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
  
      setLoading(true);
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
  
          setSuccessMessage("Cliente creado exitosamente");
          setErrorMessage("")
          resetForm();
          setLoading(false);
          return;
        }
  
        setErrorMessage(data.message);
        setSuccessMessage("");
  
      } catch (error) {
  
        console.error(error);
  
        alert("Error de conexión");
      }
      setLoading(false);
  
    }
    return (
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
                    onClose();
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
                {
                  errorMessage && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
                      {errorMessage}
                    </div>
                  )
                }
                {
                  successMessage && (
                   <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg">
                      {successMessage}
                    </div>
                  )
                }
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
    );
}