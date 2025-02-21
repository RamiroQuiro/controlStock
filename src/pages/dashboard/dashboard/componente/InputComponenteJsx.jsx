export default function InputComponenteJsx({
  placeholder,
  value,
  handleChange,
  name,
  type,
  id,
  disable,
  tab,
}) {
  return (
    <div className="w-full">
      <input
      tabIndex={tab}
        className="w-full text-end py-2 px-3 text-primary-textoTitle rounded-lg bg-white border-primary-150 border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-100/50"
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
