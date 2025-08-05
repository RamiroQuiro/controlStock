import {
  User,
  Mail,
  Shield,
  IdCard,
  Phone,
  MapPin,
  CalendarDays,
  UserCheck,
  UploadIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import InputComponenteJsx from '../../dashboard/componente/InputComponenteJsx';
import LoaderReact from '../../../../utils/loader/LoaderReact';

const initialUserData = {
  razonSocial: '',
  apellido: '',
  email: '',
  rol: '',
  documento: '',
  telefono: '',
  direccion: '',
  fechaAlta: '',
  tipoUsuario: '',
  srcPhoto: '',
};

export default function FormularioPerfilUser({ user }) {
  const [userData, setUserData] = useState({ ...initialUserData, ...user });
  const [originalUserData, setOriginalUserData] = useState(null);
  const [disable, setDisable] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fechtUser = async () => {
      try {
        const dataUserFetch = await fetch(
          `/api/users/getUsers?getUsers=${user.id}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        if (dataUserFetch.ok) {
          const data = await dataUserFetch.json();
          setUserData(data.data);
          setOriginalUserData(data.data); // Guardar el estado original
        }
      } catch (error) {
        console.error(error);
      }
    };
    fechtUser();
  }, [user.id]);

  const handleChange = (e) => {
    setUserData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDisable(true);
    try {
      setLoading(true);
      const res = await fetch('/api/users/updateUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (res.ok) {
        const updated = await res.json();
        setUserData(updated.data);
        setOriginalUserData(updated.data); // Actualizar el estado original con los datos guardados
        setDisable(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setUserData(originalUserData); // Restaurar los datos originales
    setDisable(false); // Salir del modo de edición
  };

  const handleChangeImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserData((prev) => ({
          ...prev,
          srcPhoto: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full p-2">
      <div className="flex flex-col md:flex-row items-center gap-4  w-full">
        <div className="w-1/4 gap-2 flex flex-col items-center justify-center group ">
          <div className="w-full flex flex-col items-center justify-center group relative">
            <img
              src={userData?.srcPhoto || '/default-avatar.png'}
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
              <p className="font-semibold capitalize">{`${userData?.nombre || ''} ${
                userData?.apellido || ''
              }`}</p>
            ) : (
              <div className="flex w-full justify-between items-center gap-2">
                <div className="md:w-1/2">
                  <InputComponenteJsx
                    type="text"
                    name="nombre"
                    className=""
                    value={userData.nombre}
                    handleChange={handleChange}
                  />
                </div>
                <div className="md:w-1/2">
                  <InputComponenteJsx
                    type="text"
                    name="apellido"
                    value={userData.apellido}
                    handleChange={handleChange}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2 text-gray-600">
            <Mail className="w-5 h-5" />
            {!disable ? (
              userData?.email
            ) : (
              <div className="w-ful lowercase">
                <InputComponenteJsx
                  type="text"
                  name="email"
                  className="lowercase"
                  value={userData.email}
                  handleChange={handleChange}
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-gray-600">
            <Shield className="w-5 h-5" />
            <span className="capitalize font-semibold">{userData?.rol}</span>
          </div>
        </div>
      </div>
      <hr className="my-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center gap-2">
          <IdCard className="w-5 h-5 text-primary-100" />
          <span className="font-semibold text-gray-700">Documento:</span>
          {!disable ? (
            userData?.documento || '—'
          ) : (
            <div className="w-full">
              <InputComponenteJsx
                type="number"
                name="documento"
                className="lowercase"
                value={userData.documento}
                handleChange={handleChange}
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-primary-100" />
          <span className="font-semibold text-gray-700">Teléfono:</span>
          {!disable ? (
            userData?.telefono || '—'
          ) : (
            <div className="w-full">
              <InputComponenteJsx
                type="text"
                name="telefono"
                value={userData.telefono}
                handleChange={handleChange}
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary-100" />
          <span className="font-semibold text-gray-700">Dirección:</span>
          {!disable ? (
            userData?.direccion || '—'
          ) : (
            <div className="w-full">
              <InputComponenteJsx
                type="text"
                name="direccion"
                value={userData.direccion}
                handleChange={handleChange}
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary-100" />
          <span className="font-semibold text-gray-700">Fecha de Alta:</span>
          <span className="text-gray-900">
            {userData?.fechaAlta
              ? new Date(userData.fechaAlta * 1000).toLocaleDateString()
              : '—'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">Tipo de Usuario:</span>
          <span className="text-gray-900 capitalize">
            {userData?.tipoUsuario}
          </span>
        </div>
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

