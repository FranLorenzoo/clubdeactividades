import TurnoCard from "./appointment-card";

export default function TurnosList({ turnos }: any) {
  return (
    <div className="grid gap-5">
      {turnos.map((turno: any, index: number) => (
        <TurnoCard key={index} turno={turno} />
      ))}
    </div>
  );
}