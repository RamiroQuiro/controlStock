import { Eye, Lock, Mail, MailCheck, User, X } from 'lucide-react';
import React, { useState } from 'react';
import { showToast } from '../../utils/toast/toastShow';
import { loader } from '../../utils/loader/showLoader';

export default function Formulario({ isLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    razonSocial: '',
  });
  const [confirmacion, setConfirmacion] = useState(false);
  const [isLook, setIsLook] = useState(false);
  console.log(isLogin);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    loader(true);
    try {
      const endpoint = isLogin ? '/api/auth/signin' : '/api/auth/signup';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log(result);
      if (response.ok) {
        if (result.status == 200) {
          if (isLogin) {
            window.location.href = '/dashboard';
          } else {
            setConfirmacion(true);
            showToast(result.msg || 'usuario creado con exito', {
              background: 'bg-green-500',
              time: 5000,
              confirmText: 'Iniciar Sesión',
              onConfirm: () => {
                setConfirmacion(false);
              },
            });
            loader(false);
          }
        } else if (result.status == 401) {
          showToast(result.msg || 'email incorrecto', {
            background: 'bg-primary-400',
          });
          loader(false);
        } else if (result.status == 402) {
          showToast(result.msg || 'error de contraseña', {
            background: 'bg-primary-400',
          });
          loader(false);
        } else if (result.status == 400) {
          showToast(result.msg, {
            background: 'bg-primary-400',
          });
          loader(false);
        }
        // Redirigir al dashboard o mostrar mensaje de éxito
        // window.location.href = '/dashboard';
      } else {
        // Manejar errores
        showToast(result.message || 'Hubo un error en la autenticación');
        loader(false);
      }
    } catch (error) {
      console.error('Error de autenticación:', error);
      showToast('Ocurrió un error inesperado');
      loader(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {confirmacion && (
        <div className="w-[45vw] h-56 bg-white  border-2 border-primary-400 rounded-xl p-4 fixed top-1/2 left-1/2 transform -translate-x-1/2  animate-aparecer flex-col -translate-y-1/2 z-50 shadow-lg flex items-center gap-5 justify-center">
          <div className="absolute top-2 right-2 cursor-pointer bg-red-500 rounded-full p-2 hover:bg-red-600 duration-200 hover:-translate-y-0.5">
            <X
              className="w-5 h-5 text-white"
              onClick={() => setConfirmacion(false)}
            />
          </div>
          <MailCheck className="w-20 h-16 fill-primary-150 stroke-primary-texto" />
          <h2 className="text-2xl font-bold text-primary-100">
            Confirmacion de Cuenta
          </h2>
          <p className="text-sm text-gray-600">
            Por favor, verifique su correo electrónica para confirmar su cuenta.
          </p>
        </div>
      )}
      {!isLogin && (
        <div>
          <div className="w-full">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="text-gray-400" size={20} />
              </div>
              <input
                id="razonSocial"
                name="razonSocial"
                type="text"
                required={!isLogin}
                value={formData.razonSocial}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Nombre de Fantasía"
              />
            </div>
          </div>
          <div className="w-full mt-2 flex items-center justify-normal gap-2">
            <label htmlFor="nombre" className="sr-only">
              Nombre
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="text-gray-400" size={20} />
              </div>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required={!isLogin}
                value={formData.nombre}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Nombre"
              />
            </div>
            <label htmlFor="apellido" className="sr-only">
              Apellido
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="text-gray-400" size={20} />
              </div>
              <input
                id="apellido"
                name="apellido"
                type="text"
                required={!isLogin}
                value={formData.apellido}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="apellido"
              />
            </div>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="email" className="sr-only">
          Correo Electrónico
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="text-gray-400" size={20} />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Correo Electrónico"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="sr-only">
          Contraseña
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="text-gray-400" size={20} />
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            required
            value={formData.password}
            onChange={handleChange}
            className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Contraseña"
          />
          {
            <button
              onClick={(e) => {
                e.preventDefault();
                const input = document.getElementById('password');
                if (input.type === 'password') {
                  input.type = 'text';
                } else {
                  input.type = 'password';
                }
              }}
              className={`absolute duration-200 text-xs bg-primary-textoTitle text-white rounded-full py-1 px-2 top-1 right-2  flex items-center justify-center h-8 cursor-pointer`}
              size={40}
            >
              mostrar
            </button>
          }
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
        </button>
      </div>
    </form>
  );
}
