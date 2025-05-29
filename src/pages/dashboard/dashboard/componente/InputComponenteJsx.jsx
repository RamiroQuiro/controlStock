export default function InputComponenteJsx({
  placeholder,
  value,
  handleChange,
  name,
  type,
  id,
  disable,
  tab,
  className,
}) {
  return (
    <div className="w-full">
      <input
        tabIndex={tab}
        className={`${className} w-full text-start  py-1 px-3 text-primary-textoTitle rounded-lg bg-white border-primary-150 border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-100/50`}
        name={name}
        type={type}
        disabled={disable}
        id={id}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </div>
  );
}
