import {useState } from "react";
import crypto from "crypto";
import { useEffect } from "react";

type Activity = {
  id: number;
  name: string;
}
type Props = {
  onClose: () => void;
};

const generateRandomPassword = () => {
  return crypto.randomBytes(5).toString("hex");
};
const today = new Date();
today.setFullYear(today.getFullYear() - 18);
const maxDate = today.toISOString().split("T")[0];

function calculateAge(fechaNacimiento: string) {
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

type EmployeeFormValues = {
  nombre: string;
  email: string;
  role: string;
  password: string;
  confirmarPassword: string;
};

export default function CreateProfessor({onClose}: Props) {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dni, setDni] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [activityId, setActivityId] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  function resetForm() {
      setName("");
      setLastName("");
      setEmail("");
      setDni("");
      setFechaNacimiento("");
      setActivityId("");
  }
  useEffect(() => {
      fetch('/api/activity')
      .then(res => res.json())
      .then(actData => {
        setActivities(actData)
      })
      .catch(error => {
        console.error(error)
        alert("Error al cargar actividades")
      });
      }, [])

  async function handleCreateProfessor (e: React.FormEvent<HTMLFormElement>) {
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
                roleId: 4,
                password: generateRandomPassword(),
                activityId: Number(activityId),
              }),
            }
          );
    
          const data = await response.json();
    
          if (response.ok) {
            alert("Profesor creado");
    
            onClose();
            resetForm();
            return;
          }
    
          alert(
            data.message ||
            "Error al crear profesor"
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
                    Crear profesor
                  </h2>

                  <button
                    onClick={() => {
                      onClose();
                      resetForm();
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
                onSubmit={handleCreateProfessor}
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

                  <select
                  name="activityId"
                  value={activityId}
                  className="w-full border rounded-xl p-4"
                  onChange={(e) =>
                    setActivityId(e.target.value)
                  }
                >
                  <option value="" disabled>
                    Seleccione una actividad
                  </option>

                  {activities.map((activity) => (
                    <option
                      key={activity.id}
                      value={activity.id}
                    >
                      {activity.name}
                    </option>
                  ))}
                </select>

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
                    disabled={!name || !lastName || !email || !dni || !fechaNacimiento || !activityId}
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
                        ? "Creando profesor..."
                        : "Crear profesor"
                    }
                  </button>

                </form>

              </div>

            </div>
    );
}