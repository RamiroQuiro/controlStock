const CategoriasList = ({ categorias, onSelect }) => (
  <div className="absolute top-[110%] text-xs animate-aparecer duration-300 text-primary-textoTitle font-semibold right-0 w-full max-h-40 overflow-y-auto bg-primary-bg-componentes rounded-lg shadow-md border z-10">
    <ul className="space-y-1">
      {categorias.map((categoria) => (
        <li
          onClick={() => onSelect(categoria)}
          key={categoria.id}
          className="cursor-pointer hover:bg-primary-texto/30 duration-300 ease-in-out p-2 rounded-lg"
        >
          {categoria.nombre}
        </li>
      ))}
    </ul>
  </div>
);

export default CategoriasList;
