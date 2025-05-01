import { Lock, Mail, User } from 'lucide-react';
import React, { useState } from 'react';
import { showToast } from '../../utils/toast/toastShow';
import { loader } from '../../utils/loader/showLoader';

export default function Formulario({ isLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
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

      if (response.ok) {
        if (result.status == 200) {
          window.location.href = '/dashboard';
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
      {!isLogin && (
        <div>
          <div className="w-full">
            <label htmlFor="userName" className="sr-only">
              Nombre de Usuario
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="text-gray-400" size={20} />
              </div>
              <input
                id="userName"
                name="userName"
                type="text"
                required={!isLogin}
                value={formData.userName}
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
