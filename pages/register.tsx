import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";

export default function Register() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dni, setDni] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  const hoy = new Date();

  const fechaMaxima = new Date(
    hoy.getFullYear() - 18,
    hoy.getMonth(),
    hoy.getDate()
  )
    .toISOString()
    .split("T")[0];

  const calcularEdad = (fecha: string) => {
    const nacimiento = new Date(fecha);

    let edad =
      hoy.getFullYear() -
      nacimiento.getFullYear();

    const mes =
      hoy.getMonth() -
      nacimiento.getMonth();

    if (
      mes < 0 ||
      (
        mes === 0 &&
        hoy.getDate() <
        nacimiento.getDate()
      )
    ) {
      edad--;
    }

    return edad;
  };

  const handleRegister = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    const nombreInput =
      document.querySelector(
        'input[placeholder="Nombre"]'
      ) as HTMLInputElement;

    const apellidoInput =
      document.querySelector(
        'input[placeholder="Apellido"]'
      ) as HTMLInputElement;

    const emailInput =
    document.querySelector(
    'input[placeholder="Correo electrónico"]'
    ) as HTMLInputElement;

    const dniInput =
      document.querySelector(
        'input[placeholder="DNI"]'
      ) as HTMLInputElement;

    const fechaInput =
      document.querySelector(
        'input[type="date"]'
      ) as HTMLInputElement;

    const passwordInput =
      document.querySelector(
        'input[type="password"]'
      ) as HTMLInputElement;

    [
      nombreInput,
      apellidoInput,
      emailInput,
      dniInput,
      fechaInput,
      passwordInput
    ]
    .filter(Boolean)
    .forEach((input)=>{
      input.setCustomValidity("");
    });
    if (!name.trim()) {

      nombreInput.setCustomValidity(
        "El nombre es obligatorio"
      );

      nombreInput.reportValidity();

      return;
    }

    if (!lastName.trim()) {

      apellidoInput.setCustomValidity(
        "El apellido es obligatorio"
      );

      apellidoInput.reportValidity();

      return;
    }

    if (!email.trim()) {

      emailInput.setCustomValidity(
        "El correo es obligatorio"
      );

      emailInput.reportValidity();

      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailRegex.test(email)
    ) {

      emailInput.setCustomValidity(
        "Ingresá un correo válido"
      );

      emailInput.reportValidity();

      return;
    }

    if (!dni.trim()) {

      dniInput.setCustomValidity(
        "El DNI es obligatorio"
      );

      dniInput.reportValidity();

      return;
    }

    if (!birthDate) {

      fechaInput.setCustomValidity(
        "Ingresá una fecha"
      );

      fechaInput.reportValidity();

      return;
    }

    const edad =
      calcularEdad(birthDate);

    if (edad < 18) {

      fechaInput.setCustomValidity(
        "Debés ser mayor de 18 años"
      );

      fechaInput.reportValidity();

      return;
    }

    if (!password.trim()) {

      passwordInput.setCustomValidity(
        "La contraseña es obligatoria"
      );

      passwordInput.reportValidity();

      return;
    }

    if (
      password.length < 8
    ) {

      passwordInput.setCustomValidity(
        "La contraseña debe tener al menos 8 caracteres"
      );

      passwordInput.reportValidity();

      return;
    }

    try {

      const res = await fetch("/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name,
          lastName,
          dni,
          age: edad,
          roleId: 1,
        }),
      });

      const data = await res.json();
      const createClientRes = await fetch("/api/client", {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          userId: data.id,
          suspended: false,
          active: true,
        })
      });
      if (res.ok && createClientRes.ok) {

        setMensajeExito(
          "Usted ha sido registrado con éxito"
        );

        setTimeout(() => {
          router.push("/login");
        }, 2000);

      } else {

        if (
          data.message ===
          "El correo ya está registrado"
        ) {

          emailInput.setCustomValidity(
            "El correo ya está registrado"
          );

          emailInput.reportValidity();

          return;
        }

      }

    } catch {

      alert(
        "Error al registrar usuario"
      );

    }

  };

  return (
    <main className="min-h-screen grid md:grid-cols-2">

      <section className="hidden md:flex bg-green-700 text-white items-center justify-center p-12">

        <div>

          <h1 className="text-5xl font-bold mb-6">
            Sumate Hoy
          </h1>

          <p className="text-xl text-green-100">
            Creá tu cuenta y empezá a reservar.
          </p>

        </div>

      </section>

      <section className="flex items-center justify-center bg-zinc-100 px-6">

        <div className="bg-white w-full max-w-md p-10 rounded-2xl shadow-xl">
          {mensajeExito && (
            <div className="
              bg-green-100
              border
              border-green-500
              text-green-700
              px-4
              py-3
              rounded-lg
              mb-4
              text-center
              font-medium
            ">
              ✅ {mensajeExito}
            </div>
          )}

          <h2 className="text-3xl font-bold text-center mb-6">
            Registrarse
          </h2>

          <form
            onSubmit={handleRegister}
            noValidate
            className="space-y-4"
          >

         <input
          type="text"
          placeholder="Nombre"
          className="w-full border p-3 rounded-lg"
          value={name}
          onChange={(e)=>{
            e.target.setCustomValidity("");
            setName(e.target.value);
          }}
        />

        <input
          type="text"
          placeholder="Apellido"
          className="w-full border p-3 rounded-lg"
          value={lastName}
          onChange={(e)=>{
            e.target.setCustomValidity("");
            setLastName(e.target.value);
          }}
        />

        <input
        type="text"
        placeholder="Correo electrónico"
        className="w-full border p-3 rounded-lg"
        value={email}
        onChange={(e)=>{
          e.target.setCustomValidity("");
          setEmail(e.target.value);
        }}
      />

        <input
          type="text"
          placeholder="DNI"
          className="w-full border p-3 rounded-lg"
          value={dni}
          onChange={(e)=>{
            e.target.setCustomValidity("");
            setDni(e.target.value);
          }}
        />

        <input
          type="date"
          className="w-full border p-3 rounded-lg"
          value={birthDate}
          max={fechaMaxima}
          onChange={(e)=>{
            e.target.setCustomValidity("");
            setBirthDate(e.target.value);
          }}
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="w-full border p-3 rounded-lg"
          value={password}
          onChange={(e)=>{
            e.target.setCustomValidity("");
            setPassword(e.target.value);
          }}
        />

            <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition">

              Crear cuenta

            </button>

          </form>

          <p className="text-center mt-6 text-sm">

            ¿Ya tenés cuenta?{" "}

            <Link
              href="/login"
              className="text-blue-600"
            >
              Iniciar sesión
            </Link>

          </p>

        </div>

      </section>

    </main>
  );
}