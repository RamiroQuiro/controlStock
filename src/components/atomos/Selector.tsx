import React from "react";

type Props = {
  name: string;
  labelOption?: string;
  defaultSelect: boolean;
  options: { id: string; name?: string; value: string; nombre?: string }[];
  handleSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export default function Selector({
  name,
  labelOption,
  defaultSelect,
  options,
  handleSelect,
}: Props) {
  return (
    <div className="flex flex-col w-full">
      <label
        htmlFor={name}
        className="mb-1 text-sm font-semibold text-primary-texto disabled:text-gray-400"
      >
        {labelOption}
      </label>
      <select
        onSelect={handleSelect}
        name={name}
        id={name}
        className={`p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-primary-100 focus:border-primary-100 placeholder:text-gray-400 transition`}
      >
        {defaultSelect ? (
          <option value="unidad" className="px-3 w-full text-primary-texto">
            Unidad
          </option>
        ) : (
          <option selected disabled className="px-3 w-full text-primary-texto">
            Seleccionar...
          </option>
        )}
        {options.map((opcion) => {
          return (
            <option
              value={opcion.value}
              id={opcion.id}
              className="px-3 w-full text-primary-texto"
            >
              {opcion.name || opcion.nombre || opcion.value}
            </option>
          );
        })}
      </select>
    </div>
  );
}
