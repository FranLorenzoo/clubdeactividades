import {FormEvent, useEffect, useState } from "react";
import CreateProfessor from "./Modal/create-professor";
import toast from "react-hot-toast";

type Professor = {
  id: number,
  user: {
    email: string;
    name: string;
    lastName: string;
    dni: string;
    id: number;
    isDeleted: boolean;
  },
  activity: {
    id: number,
    name: string
  }
}

export default function SearchBarProfessor(){
    const [professors, setProfessors] = useState<Professor[]>([]); 
    const [loadingProfessors, setLoadingProfessors] = useState(true);
    const [openProfessor, setOpenProfessor] = useState(false);
    const [filteredProfessors, setFilteredProfessors] = useState<Professor[]>([]);


    useEffect (()=>{
      setLoadingProfessors(true);
        async function fetchProfessor(){
            try {
                const res = await fetch("/api/professor"); 
                if (res.ok){
                    const data = await res.json(); 
                    setProfessors(data); 
                    setFilteredProfessors(data)
                }
            }catch(err){
                console.error("Error cargando profesores", err); 
            }
            setLoadingProfessors(false);
        }
        fetchProfessor(); 
    }, []) 


    const deleteProfessor = async (idUno: number) => {
    try {
      const res= await fetch(`/api/professor/${idUno}`, { method: "DELETE" });
      if (res.ok){
        setProfessors((prev) => prev.filter((pro) => pro.id !== idUno));
        setFilteredProfessors((prev) => prev.filter((pro) => pro.id !== idUno));
        toast.success("El profesor fue eliminado con éxito");
      }
    } catch (error) {
      console.error("Error eliminando profesor:", error);
      toast.error("Error inesperado al eliminar profesor");
    }
  };

    function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = String(formData.get("searchValue"));
      const filteredProfessors = professors.filter(professor => 
        professor.user.dni.includes(searchValue)
        || professor.user.email.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())
      );
      setFilteredProfessors(filteredProfessors);
    }
    
    return ( <>
          <div className="flex items-center gap-3 w-full max-w-xl mx-auto mt-[50px] relative z-10">
    
            <form
              className="flex gap-3"
              onSubmit={handleSearch}
            >
    
              <input
                type="text"
                placeholder="Buscar por DNI o Email"
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
                  focus:ring-green-600
                "
              />
              <button
            className="gap-3 bg-green-600 text-white px-5 py-2 rounded-xl whitespace-nowrap hover:opacity-90 transition"
          >
            Buscar
          </button>
            </form>
    
            <button
              onClick={() => setOpenProfessor(true)}
              className="gap-3 bg-green-600 text-white px-5 py-2 rounded-xl whitespace-nowrap hover:opacity-90 transition">
              Crear profesor
            </button>
          </div>
    
    
          {
            openProfessor  && (
    
              <CreateProfessor
                onClose={() => setOpenProfessor(false)}
                onProfessorCreated={(newProfessor) => {
                  setProfessors((prev) => [...prev, newProfessor]);
                  setFilteredProfessors((prev) => [...prev, newProfessor]);
                  setOpenProfessor(true);
                }}
              />
            )
          }
        <div className="mt-6 max-w-xl mx-auto">
  <h3 className="text-lg font-bold mb-3">Lista de profesores</h3>
  {loadingProfessors ? (
    <p className="text-gray-500">Cargando profesores...</p>
    ) : filteredProfessors.length === 0 ? (
    <p className="text-gray-500">No se encontraron profesores.</p>
  ) : (
    <ul className="space-y-2">
      {filteredProfessors.filter(pro => !pro.user.isDeleted).map((pro) => (
        <li
          key={pro.id}
          className="border rounded-lg px-4 py-3 bg-white shadow-sm"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-600">Nombre</p>
            <p className="text-gray-700 text-sm font-semibold">{pro.user?.name} {pro.user?.lastName}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">DNI</p>
            <p className="text-gray-700 text-sm font-semibold">{pro.user?.dni}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Actividad</p>
            <p className="text-gray-700 text-sm font-semibold">{pro.activity?.name ?? "Sin actividad"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Email</p>
            <p className="text-gray-700 text-sm font-semibold">{pro.user?.email}</p>
          </div>
        </div>
      </li>
     ))}
  </ul>
  )}
  </div>
  </>
);}