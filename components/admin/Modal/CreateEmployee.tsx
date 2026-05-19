import { useState} from "react";
import { getMaxDate, generateRandomPassword, calculateAge} from "@/lib/utils/helpers";

type Props = {
  onClose: () => void;
};
const maxDate = getMaxDate();

type EmployeeFormValues = {
  nombre: string;
  email: string;
  role: string;
  password: string;
  confirmarPassword: string;
};


export default function CreateEmployee({onClose}: Props) {
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

  async function handleCreateEmployee (e: React.FormEvent<HTMLFormElement>) {
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
                roleId: 3,
                password: generateRandomPassword(),
              }),
            }
          );
    
          const data = await response.json();
    
          if (response.ok) {
            alert("Empleado creado");
    
            onClose();
            resetForm();
            return;
          }
    
          alert(
            data.message ||
            "Error al crear empleado"
          );
    
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
                  Crear empleado
                </h2>

                <button
                  onClick={() => {
                    resetForm();
                    onClose();
                  }}
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
              onSubmit={handleCreateEmployee}
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
                  {
                      loading
                        ? "Creando empleado..."
                        : "Crear empleado"
                    }
                </button>
              </form>
            </div>
          </div>
  );
};
