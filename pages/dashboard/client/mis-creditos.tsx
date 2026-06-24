import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

type Credit = {
  id: number;
  activity: {
    name: string;
  };
  grantedAt: string;
  endDate: string;
  isValid: boolean;
};

export default function MisCreditosPage() {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const clientRes = await fetch(`/api/client/user/${userId}`);
        const client = await clientRes.json();

        const creditRes = await fetch(`/api/credit/client/${client.id}`);
        const data = await creditRes.json();

        setCredits(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCredits();
  }, []);

  // 📊 agrupación por actividad
  const grouped = credits.reduce((acc, c) => {
    const key = c.activity.name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {} as Record<string, Credit[]>);

  const totalCredits = credits.length;

  const isExpiringSoon = (endDate: string) => {
    const diff =
      new Date(endDate).getTime() - Date.now();

    return diff <= 7 * 24 * 60 * 60 * 1000 && diff > 0;
  };

  return (
    <DashboardLayout role="CLIENT">
      <div className="space-y-8">

        {/* HEADER PRO */}
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-green-950 p-8">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/20 blur-3xl rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-green-400/10 blur-3xl rounded-full" />

          <h1 className="text-4xl font-extrabold tracking-tight">
            Mis créditos
          </h1>

          <p className="text-zinc-400 mt-2">
            Tenés {totalCredits} créditos activos en tu cuenta
          </p>
        </div>

        {/* LOADING */}
        {loading ? (
          <p className="text-zinc-500">Cargando créditos...</p>
        ) : (
          <div className="space-y-6">

            {Object.keys(grouped).length === 0 ? (
              <div className="text-center text-zinc-500 border border-dashed border-zinc-700 rounded-2xl p-10">
                No tenés créditos activos en este momento
              </div>
            ) : (
              Object.entries(grouped).map(([activity, list]) => (
                <div
                  key={activity}
                  className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6"
                >
                  {/* HEADER ACTIVIDAD */}
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-bold">{activity}</h2>

                    <span className="text-xs px-3 py-1 rounded-full bg-green-500/10 text-green-300 border border-green-800">
                      {list.length} créditos
                    </span>
                  </div>

                  {/* CARDS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {list.map((c) => {
                      const expiring = isExpiringSoon(c.endDate);

                      return (
                        <div
                          key={c.id}
                          className="relative rounded-2xl border border-zinc-800 bg-zinc-900 p-5 hover:border-green-600 transition"
                        >
                          {/* badge */}
                          {expiring && (
                            <span className="absolute top-3 right-3 text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-300 border border-yellow-700 animate-pulse">
                              Vence pronto
                            </span>
                          )}

                          <div className="flex justify-between mb-4">
                            <p className="font-semibold">
                              Crédito activo
                            </p>
                          </div>

                          <div className="space-y-2 text-sm text-zinc-300">
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Otorgado</span>
                              <span>{formatDate(c.grantedAt)}</span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-zinc-500">Vence</span>
                              <span>{formatDate(c.endDate)}</span>
                            </div>
                          </div>

                          {expiring && (
                            <p className="mt-3 text-xs text-yellow-400">
                              ⚠ Usalo pronto antes de que expire
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}

          </div>
        )}
      </div>
    </DashboardLayout>
  );
}