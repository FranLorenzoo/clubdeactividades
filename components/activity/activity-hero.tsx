import Link from "next/link";

export default function ActivityHero({ activity }: any) {
  if (!activity) return null;
  return (
    <section className={`bg-gradient-to-r ${activity.color} py-20 px-6`}>
      <div className="max-w-7xl mx-auto">

        <Link href="/" className="text-white/80 hover:text-white text-sm">
          ← Volver al inicio
        </Link>

        <div className="mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">

          <div>
            <p className="text-7xl mb-4">{activity.icon}</p>

            <h1 className="text-5xl md:text-6xl font-bold mb-5">
              {activity.name}
            </h1>

            <p className="text-lg md:text-xl text-white/90 max-w-2xl">
              {activity.description}
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}