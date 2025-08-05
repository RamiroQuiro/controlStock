import {
  Building,
  Mail,
  Phone,
  MapPin,
  FileText,
  CalendarDays,
  UploadIcon,
  UserCheck,
  Shield,
  IdCard,
  Building2Icon,
  CalendarDaysIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  IdCardIcon,
  PaintRollerIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import LoaderReact from "../../../../../utils/loader/LoaderReact";
import InputComponenteJsx from "../../../dashboard/componente/InputComponenteJsx";
import {
  formatearFechaArgentina,
  getFechaUnix,
} from "../../../../../utils/timeUtils";

const inicialEmpresaData = {
  razonSocial: "",
  cuit: "",
  email: "",
  telefono: "",
  direccion: "",
  fechaAlta: new Date(),
  srcLogo: "",
};

export default function FormularioEmpresa({ user }) {
  const [empresaData, setEmpresaData] = useState(inicialEmpresaData);
  const [originalEmpresaData, setOriginalEmpresaData] = useState(null);
  const [disable, setDisable] = useState(false);
  const [loading, setLoading] = useState(false);

  const fechaHoy = getFechaUnix();

  useEffect(() => {
    const fetchEmpresa = async () => {
      try {
        const response = await fetch(
          `/api/empresa/getEmpresa?userId=${user.id}`
        );
        if (response.ok) {
          const data = await response.json();
          setEmpresaData(data.data);
          setOriginalEmpresaData(data.data);
        }
      } catch (error) {
        console.error("Error fetching empresa data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmpresa();
  }, [user.id]);

  const handleChange = (e) => {
    setEmpresaData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/empresa/updateEmpresa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...empresaData, userId: user.id }),
      });
      if (res.ok) {
        const updated = await res.json();
        setEmpresaData(updated.data);
        setOriginalEmpresaData(updated.data);
        setDisable(false);
      }
    } catch (error) {
      console.error("Error updating empresa:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEmpresaData(originalEmpresaData);
    setDisable(false);
  };

  const handleChangeImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEmpresaData((prev) => ({
          ...prev,
          srcLogo: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const inputFormulario = [
    {
      name: "razonSocial",
      label: "Razon Social",
      type: "text",
      placeholder: "Ingrese la razon social",
      required: true,
      value: empresaData.razonSocial,
      handleChange: handleChange,
      icon: Building2Icon,
    },
    {
      name: "cuit",
      label: "Cuit/Cuil",
      type: "text",
      placeholder: "Ingrese el cuit/cuil",
      required: true,
      value: empresaData.cuit,
      handleChange: handleChange,
      icon: IdCardIcon,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Ingrese el email",
      required: true,
      value: empresaData.email,
      handleChange: handleChange,
      icon: MailIcon,
    },
    {
      name: "telefono",
      label: "Telefono",
      type: "text",
      placeholder: "Ingrese el telefono",
      required: true,
      value: empresaData.telefono,
      handleChange: handleChange,
      icon: PhoneIcon,
    },
    {
      name: "direccion",
      label: "Direccion",
      type: "text",
      placeholder: "Ingrese la direccion",
      required: true,
      value: empresaData.direccion,
      handleChange: handleChange,
      icon: MapPinIcon,
    },
    {
      name: "fechaAlta",
      label: "Fecha de Alta",
      type: "date",
      placeholder: "Ingrese la fecha de alta",
      required: true,
      value: empresaData.fechaAlta,
      handleChange: handleChange,
      icon: CalendarDaysIcon,
    },
    {
      name: "srcLogo",
      label: "Logo",
      type: "file",
      placeholder: "Ingrese el logo",
      required: true,
      value: empresaData.srcLogo,
      handleChange: handleChangeImage,
      icon: UploadIcon,
    },
    {
      name: "colorAsset",
      label: "Color Principal",
      type: "color",
      placeholder: "Ingrese el color principal",
      required: true,
      value: empresaData.colorAsset,
      handleChange: handleChange,
      icon: PaintRollerIcon,
    },
    {
      name: "colorSecundario",
      label: "Color Secundario",
      type: "color",
      placeholder: "Ingrese el color secundario",
      required: true,
      value: empresaData.colorSecundario,
      handleChange: handleChange,
      icon: PaintRollerIcon,
    },
  ];
  return (
    <form onSubmit={handleSubmit} className="w-full p-2">
      <div className="flex flex-col  items-start space-y-10 w-full">
        <div className="w-full flex items-center justify-between">
          <div className="w-fit flex flex-col items-center justify-center group relative">
            <img
              src={empresaData?.srcLogo || "/default-avatar.png"}
              alt="Logo"
              className="w-36 h-36 rounded-full border-4 border-primary-100 object-cover shadow"
            />
            {disable && (
              <div className="flex flex-col items-center gap-2">
                <label
                  htmlFor="srcLogo"
                  className=" absolute bg--texto border-primary-100 border  bottom-0 right-0 -translate-y-1/2 text-xs rounded-lg  p-2 cursor-pointer duration-300 scale-90 hover:scale-100"
                >
                  <UploadIcon className="w-5 h-5 stroke-primary-textoTitle" />
                </label>
                <input
                  type="file"
                  id="srcLogo"
                  name="srcLogo"
                  className="hidden"
                  onChange={handleChangeImage}
                />
              </div>
            )}
          </div>
          <div className="w-[70%]">
            <label
              htmlFor="razonSocial"
              className="text-primary-textoTitle text-2xl font-semibold flex items-center gap-2"
            >
              <Building2Icon className="w-10 h-10 stroke-primary-100" /> Razon
              Social
            </label>
            <InputComponenteJsx
              name="razonSocial"
              label="Razon Social"
              type="text"
              placeholder="Ingrese la razon social"
              required
              value={empresaData.razonSocial}
              handleChange={handleChange}
            />
          </div>
        </div>

        <div className="w-full flex flex-wrap gap-y-4 items-center justify-between">
          {inputFormulario
            .filter(
              (input) =>
                input.name !== "srcLogo" &&
                input.name !== "razonSocial" &&
                input.name !== "fechaAlta" &&
                input.name !== "colorAsset" &&
                input.name !== "colorSecundario"
            )
            .map((input) => {
              const Icon = input.icon;
              return (
                <div key={input.name} className="w-[48%]">
                  <label
                    htmlFor={input.name}
                    className="text-primary-textoTitle flex items-center gap-2 font-semibold"
                  >
                    <Icon className="w-7 h-7 stroke-primary-100" />{" "}
                    {input.label}
                  </label>
                  <InputComponenteJsx
                    name={input.name}
                    label={input.label}
                    type={input.type}
                    placeholder={input.placeholder}
                    required={input.required}
                    value={input.value}
                    handleChange={input.handleChange}
                  />
                </div>
              );
            })}
        </div>
        <div className="w-full flex  gap-x-4 items-center justify-between">
          <div className="flex-1 flex items-start gap-2 flex-col">
            <span className="text-primary-textoTitle text-lg font-semibold">
              Color de Marca
            </span>
            <div className="flex items-start gap-4 ">
              <div className="flex items-center gap-2 w-full">
                <label
                  htmlFor="colorAsset"
                  style={{ backgroundColor: empresaData.colorAsset }}
                  className="rounded-2xl p-2 border w-10 h-10 cursor-pointer"
                >
                  <input
                    className="hidden"
                    onChange={handleChange}
                    type="color"
                    name="colorAsset"
                    id="colorAsset"
                    value={empresaData.colorAsset}
                  />
                </label>
                <InputComponenteJsx
                  type="text"
                  value={empresaData.colorAsset}
                  handleChange={handleChange}
                  name="colorAsset"
                  id="colorAsset"
                  className="w-10/12 rounded-2xl p-2 border"
                />
              </div>
              <div className="flex items-center gap-2 w-full">
                <label
                  htmlFor="colorSecundario"
                  style={{ backgroundColor: empresaData.colorSecundario }}
                  className="rounded-2xl p-2  w-10 h-10 cursor-pointer"
                >
                  <input
                    className="hidden"
                    onChange={handleChange}
                    type="color"
                    name="colorSecundario"
                    id="colorSecundario"
                    value={empresaData.colorSecundario}
                  />
                </label>
                <InputComponenteJsx
                  type="text"
                  value={empresaData.colorSecundario}
                  handleChange={handleChange}
                  name="colorSecundario"
                  id="colorSecundario"
                  className="w-10/12 rounded-2xl p-2 border"
                />
              </div>
            </div>
            <h2 className="text-primary-textoTitle text-xs font-semibold">
              Este color se usará para la marca en facturas y otros documentos.
            </h2>
          </div>

          <div className="flex-1 flex items-center gap-2">
            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="w-7 h-7 stroke-primary-100" />
              <p> Fecha de alta</p>
            </div>
            <p>{formatearFechaArgentina(fechaHoy)}</p>
          </div>
        </div>
        {/* <div className="w-1/4 gap-2 flex flex-col items-center justify-center group ">
        <div className="w-full flex flex-col items-center justify-center group relative">
          <img
            src={inicialEmpresaData?.srcLogo || '/default-avatar.png'}
            alt="Avatar"
            className="w-36 h-36 rounded-full border-4 border-primary-100 object-cover shadow"
          />
          {disable && (
            <div className="flex flex-col items-center gap-2">
              <label
                htmlFor="srcPhoto"
                className=" absolute bg--texto border-primary-100 border  bottom-0 right-0 -translate-y-1/2 text-xs rounded-lg  p-2 cursor-pointer duration-300 scale-90 hover:scale-100"
              >
                <UploadIcon className="w-5 h-5 stroke-primary-textoTitle"/>
              </label>
              <input
                type="file"
                id="srcPhoto"
                name="srcPhoto"
                className="hidden"
                onChange={handleChangeImage}
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex-1">
        <div className="flex text-2xl items-center gap-2 mt-2 text-gray-600">
          <UserCheck className="w-10 h-10 stroke-primary-100  " />
          {!disable ? (
            <p className="font-semibold capitalize">{`${inicialEmpresaData?.nombre || ''} ${
              inicialEmpresaData?.apellido || ''
            }`}</p>
          ) : (
            <div className="flex w-full justify-between items-center gap-2">
              <div className="md:w-1/2">
                <InputComponenteJsx
                  type="text"
                  name="nombre"
                  className=""
                  value={inicialEmpresaData.nombre}
                  handleChange={handleChange}
                />
              </div>
              <div className="md:w-1/2">
                <InputComponenteJsx
                  type="text"
                  name="apellido"
                  value={inicialEmpresaData.apellido}
                  handleChange={handleChange}
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2 text-gray-600">
          <Mail className="w-5 h-5" />
          {!disable ? (
            inicialEmpresaData?.email
          ) : (
            <div className="w-ful lowercase">
              <InputComponenteJsx
                type="text"
                name="email"
                className="lowercase"
                value={inicialEmpresaData.email}
                handleChange={handleChange}
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 text-gray-600">
          <Shield className="w-5 h-5" />
          <span className="capitalize font-semibold">{inicialEmpresaData?.rol}</span>
        </div>
      </div> */}
      </div>

      <div className="mt-8 flex flex-col md:flex-row justify-end gap-4">
        {!disable ? (
          <button
            type="button"
            onClick={() => setDisable(true)}
            className="bg-primary-textoTitle text-white px-4 py-2 rounded hover:bg-primary-textoTitle/80 transition"
          >
            Editar Perfil
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Guardar Cambios
            </button>
          </>
        )}
      </div>
      {loading && <LoaderReact />}
    </form>
  );
}
