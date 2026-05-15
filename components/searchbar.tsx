
export default function Searchbar() {

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const value = (formData.get("searchValue") as string).trim();

    try {
      const response = await fetch(`/api/user?dni=${value}`);

      if(response.ok) {
        const user = await response.json();
        window.location.href =
          `/user/${user.id}`;
        return;
      }

      if(response.status === 404) {
        alert("Cliente no encontrado");
        return;
      }

      const errorData = await response.json();
      alert( errorData.message || "Error inesperado" );
    } catch(error) {
      console.error(error);
      alert("Error de conexión");
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          placeholder="Buscar por DNI"
          name="searchValue"
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#316788]"
        />

        <button
          type="submit"
          className="bg-[#316788] text-white px-5 py-2 rounded-xl hover:opacity-90 transition"
        >
          Buscar
        </button>
      </form>
    </div>
  );
}