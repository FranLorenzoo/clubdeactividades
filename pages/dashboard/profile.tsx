import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/layout/DashboardLayout";

type Role = "ADMIN" | "CLIENT" | "EMPLOYEE" | "PROFESSOR";

interface UserData {
  id: number;
  name: string;
  lastName: string;
  age: number;
  email: string;
  dni: string;
  client?: { id: number } | null;
}

interface CreditCardData {
  id: number;
  cardNumber: string;
  securityCode: string;
  cardHolder: string;
  expireDate: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // user form state
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");

  // password form state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // credit card state (client only)
  const [clientId, setClientId] = useState<number | null>(null);
  const [cardId, setCardId] = useState<number | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expireDate, setExpireDate] = useState("");

  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingCard, setLoadingCard] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingCard, setSavingCard] = useState(false);
  const [userMsg, setUserMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [cardMsg, setCardMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedRole = localStorage.getItem("userRole") as Role | null;
    if (!storedUserId || !storedRole) {
      router.push("/login");
      return;
    }
    setUserId(storedUserId);
    setRole(storedRole);

    const fetchUser = async () => {
      try {
        setLoadingUser(true);
        const res = await fetch(`/api/user/${storedUserId}`);
        if (!res.ok) throw new Error();
        const data: UserData = await res.json();
        setName(data.name);
        setLastName(data.lastName);
        console.log(storedRole)
        if (storedRole === "CLIENT" && data.client) {
          const clientFromAPI = await fetch(`/api/client/user/${storedUserId}`);
          const clientData = await clientFromAPI.json();
          const cid = clientData.id;
          setClientId(cid);
          setLoadingCard(true);
          const cardRes = await fetch(`/api/credit-card/client/${cid}`);
          if (cardRes.ok) {
            const card: CreditCardData = await cardRes.json();
            setCardId(card.id);
            setCardNumber(card.cardNumber);
            setSecurityCode(card.securityCode);
            setCardHolder(card.cardHolder);
            setExpireDate(card.expireDate.slice(0, 7));
          }
        }
      } catch {
        /* ignore */
      } finally {
        setLoadingUser(false);
        setLoadingCard(false);
      }
    };

    fetchUser();
  }, [router]);

  async function handleSaveUser(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSavingUser(true);
    setUserMsg(null);
    try {
      const res = await fetch(`/api/user/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), lastName: lastName.trim() }),
      });
      if (!res.ok) throw new Error();
      setUserMsg({ text: "Perfil actualizado correctamente.", ok: true });
    } catch {
      setUserMsg({ text: "Error al guardar los cambios.", ok: false });
    } finally {
      setSavingUser(false);
    }
  }

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    if (newPassword.trim() !== confirmPassword.trim()) {
      setPasswordMsg({ text: "Las contraseñas no coinciden.", ok: false });
      return;
    }
    if (newPassword.trim().length < 8) {
      setPasswordMsg({ text: "La contraseña debe tener al menos 8 caracteres.", ok: false });
      return;
    }
    setSavingPassword(true);
    setPasswordMsg(null);
    try {
      const res = await fetch(`/api/user/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword.trim() }),
      });
      if (!res.ok) throw new Error();
      setPasswordMsg({ text: "Contraseña actualizada correctamente.", ok: true });
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordMsg({ text: "Error al cambiar la contraseña.", ok: false });
    } finally {
      setSavingPassword(false);
    }
  }

  const verifyData = cardNumber.trim().length > 0 && securityCode.trim().length > 0 && cardHolder.trim().length > 0 && expireDate.trim().length > 0 && clientId !== null;

  async function handleSaveCard(e: React.FormEvent) {
    e.preventDefault();
    console.log("Saving card for clientId", clientId);
    if (!clientId) return;
    setSavingCard(true);
    setCardMsg(null);
    try {
      if (!/^\d{16}$/.test(cardNumber.trim())) {
        setCardMsg({ text: "El número de tarjeta debe tener exactamente 16 dígitos numéricos.", ok: false });
        setSavingCard(false);
        return;
      }
      if (!/^\d{3}$/.test(securityCode.trim())) {
        setCardMsg({ text: "El código de seguridad debe tener exactamente 3 dígitos numéricos.", ok: false });
        setSavingCard(false);
        return;
      }
      const body = {
        cardNumber: cardNumber.trim(),
        securityCode: securityCode.trim(),
        cardHolder: cardHolder.trim(),
        expireDate: new Date(expireDate).toISOString(),
        clientId,
      };

      let res: Response;
      if (cardId) {
        res = await fetch(`/api/credit-card/${cardId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/credit-card", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const card: CreditCardData = await res.json();
          setCardId(card.id);
        }
      }
      if (!res.ok) throw new Error();
      setCardMsg({ text: cardId ? "Tarjeta actualizada correctamente." : "Tarjeta agregada correctamente.", ok: true });
    } catch {
      setCardMsg({ text: "Error al guardar la tarjeta.", ok: false });
    } finally {
      setSavingCard(false);
    }
  }

  if (!role) return null;

  const inputCls =
    "w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-3 text-white outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 placeholder:text-zinc-500";
  const labelCls = "block text-sm font-medium text-zinc-400 mb-1.5";

  return (
    <DashboardLayout role={role}>
      <div className="max-w-2xl mx-auto space-y-10">
        <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>

        {/* ── User data form ─────────────────────────────────────── */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Datos personales</h2>

          {loadingUser ? (
            <p className="text-zinc-400">Cargando datos...</p>
          ) : (
            <form onSubmit={handleSaveUser} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Nombre</label>
                  <input
                    type="text"
                    className={inputCls}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Nombre"
                  />
                </div>
                <div>
                  <label className={labelCls}>Apellido</label>
                  <input
                    type="text"
                    className={inputCls}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="Apellido"
                  />
                </div>
              </div>

              {userMsg && (
                <p className={`text-sm font-medium ${userMsg.ok ? "text-green-400" : "text-red-400"}`}>
                  {userMsg.text}
                </p>
              )}

              <button
                type="submit"
                disabled={savingUser}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 rounded-2xl font-semibold transition"
              >
                {savingUser ? "Guardando..." : "Guardar cambios"}
              </button>
            </form>
          )}
        </section>

        {/* ── Change password section ────────────────────────────── */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Cambiar contraseña</h2>
          <form onSubmit={handleSavePassword} className="space-y-5">
            <div>
              <label className={labelCls}>Nueva contraseña</label>
              <input
                type="password"
                className={inputCls}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className={labelCls}>Confirmar nueva contraseña</label>
              <input
                type="password"
                className={inputCls}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            {passwordMsg && (
              <p className={`text-sm font-medium ${passwordMsg.ok ? "text-green-400" : "text-red-400"}`}>
                {passwordMsg.text}
              </p>
            )}

            <button
              type="submit"
              disabled={savingPassword}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 rounded-2xl font-semibold transition"
            >
              {savingPassword ? "Guardando..." : "Cambiar contraseña"}
            </button>
          </form>
        </section>

        {/* ── Credit card section (client only) ──────────────────── */}
        {role === "CLIENT" && (
          <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <h2 className="text-xl font-semibold text-white mb-1">
              Tarjeta de crédito
            </h2>
            <p className="text-sm text-zinc-500 mb-6">
              Modificá los datos de tu tarjeta.
            </p>

            {loadingCard ? (
              <p className="text-zinc-400">Cargando tarjeta...</p>
            ) : (
              <form onSubmit={handleSaveCard} className="space-y-5">
                <div>
                  <label className={labelCls}>Número de tarjeta</label>
                  <input
                    type="text"
                    className={inputCls}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
                    required
                    placeholder="1234 5678 9012 3456"
                    maxLength={16}
                    inputMode="numeric"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Código de seguridad</label>
                    <input
                      type="password"
                      className={inputCls}
                      value={securityCode}
                      onChange={(e) => setSecurityCode(e.target.value.replace(/\D/g, ""))}
                      required
                      placeholder="•••"
                      maxLength={3}
                      autoComplete="off"
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Fecha de vencimiento</label>
                    <input
                      type="month"
                      className={inputCls}
                      value={expireDate}
                      onChange={(e) => setExpireDate(e.target.value)}
                      required
                      min={new Date().toISOString().slice(0, 7)}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Nombre del titular</label>
                  <input
                    type="text"
                    className={inputCls}
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    required
                    placeholder="Nombre Apellido"
                  />
                </div>

                {cardMsg && (
                  <p className={`text-sm font-medium ${cardMsg.ok ? "text-green-400" : "text-red-400"}`}>
                    {cardMsg.text}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={savingCard || !verifyData}
                  className={`
                    w-full
                    py-3
                    rounded-2xl
                    font-semibold
                    transition

                    ${
                      savingCard || !verifyData
                        ? "bg-zinc-700 text-zinc-400 cursor-not-allowed opacity-60"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }
                  `}
                >
                  {savingCard
                    ? "Guardando..."
                    : cardId
                      ? "Actualizar tarjeta"
                      : "Agregar tarjeta"}
                </button>
              </form>
            )}
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
