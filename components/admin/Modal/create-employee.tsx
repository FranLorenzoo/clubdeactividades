import { useState} from "react";
import { getMaxDate, generateRandomPassword, calculateAge} from "@/lib/utils/helpers";

type Employee = {
  id: number,
  user: {
    name: string;
    lastName: string;
    email: string;
    dni: string;
    id: number;
  }
}

type Props = {
  onClose: () => void;
  onEmployeeCreated: (newEmployee: Employee) => void;
};
const maxDate = getMaxDate();

export default function CreateEmployee({onClose, onEmployeeCreated}: Props) {
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

  async function handleCreateEmployee (e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const emailInput =
      document.querySelector(
      'input[placeholder="Email"]'
    ) as HTMLInputElement;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      emailInput.setCustomValidity(
        "Ingresá un correo válido"
      );
      emailInput.reportValidity();
      return;
    }
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
            setSuccessMessage("Empleado creado exitosamente");
            setErrorMessage("")
            resetForm();
            setLoading(false);
            const employeeResponse = await fetch(
              `/api/employee?dni=${data.dni}`
            );
            const createdEmployee = await employeeResponse.json();
            onEmployeeCreated(createdEmployee);
            return;
          }

          setErrorMessage(data.message)
          setSuccessMessage("")
    
        } catch (error) {
    
          console.error(error);
    
          alert("Error de conexión");
        }
    setLoading(false);
  }

  const inputClsMedium =
    "w-1/2 bg-zinc-800 border border-zinc-700 rounded-2xl p-4 text-white outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 placeholder:text-zinc-500";
  const inputCls =
    "w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 text-white outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 placeholder:text-zinc-500";
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
              className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-2xl p-8 shadow-xl"
            >

              <div className="flex justify-between items-center mb-6">

                <h2 className="text-2xl font-bold text-white">
                  Crear empleado
                </h2>

                <button
                  onClick={() => {
                    resetForm();
                    onClose();
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
              onSubmit={handleCreateEmployee}
              className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="name"
                    placeholder="Nombre"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className={inputClsMedium}
                  />

                  <input
                    type="text"
                    name="lastName"
                    placeholder="Apellido"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className={inputClsMedium}
                  />
              </div>

                <input
                  type="text"
                  name="email"
                  placeholder="Email"
                  value={email}
                  onChange={(event) =>{ event.target.setCustomValidity("");
                    setEmail(event.target.value)}}
                  className={inputCls}
                />

                <input
                  type="text"
                  name="dni"
                  placeholder="DNI"
                  maxLength={8}
                  minLength={8}
                  value={dni}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (/^\d*$/.test(value)) {
                      setDni(value);
                    }
                  }}
      
                  className={inputCls}
                />

                <input
                  type="date"
                  name="fechaNacimiento"
                  max={maxDate}
                  placeholder="Fecha de nacimiento (YYYY-MM-DD)"
                  value={fechaNacimiento}
                  onChange={(event) => setFechaNacimiento(event.target.value)}
                  className={inputCls}
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
                    bg-green-600
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
