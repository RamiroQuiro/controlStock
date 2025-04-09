import React, { useState } from 'react';
import { Lock, Mail, User, LogIn, UserPlus } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/api/auth/signin' : '/api/auth/signup';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (response.ok) {
        // Redirigir al dashboard o mostrar mensaje de éxito
        window.location.href = '/dashboard';
      } else {
        // Manejar errores
        alert(result.message || 'Hubo un error en la autenticación');
      }
    } catch (error) {
      console.error('Error de autenticación:', error);
      alert('Ocurrió un error inesperado');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white shadow-xl rounded-xl p-8 border border-gray-100">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin 
              ? '¡Bienvenido de nuevo!' 
              : 'Regístrate para acceder a tu panel'}
          </p>
        </div>
        
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button 
              type="button"
              onClick={() => setIsLogin(true)}
              className={`
                px-4 py-2 text-sm font-medium 
                ${isLogin 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-white text-gray-900 hover:bg-gray-100'}
                border border-gray-200 rounded-l-lg
              `}
            >
              <LogIn className="inline-block mr-2" size={18} />
              Iniciar Sesión
            </button>
            <button 
              type="button"
              onClick={() => setIsLogin(false)}
              className={`
                px-4 py-2 text-sm font-medium 
                ${!isLogin 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-white text-gray-900 hover:bg-gray-100'}
                border-t border-b border-r border-gray-200 rounded-r-lg
              `}
            >
              <UserPlus className="inline-block mr-2" size={18} />
              Registrarse
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label htmlFor="username" className="sr-only">Nombre de Usuario</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="text-gray-400" size={20} />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required={!isLogin}
                  value={formData.username}
                  onChange={handleChange}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Nombre de Usuario"
                />
              </div>
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="sr-only">Correo Electrónico</label>
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
            <label htmlFor="password" className="sr-only">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="text-gray-400" size={20} />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
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

        {isLogin && (
          <div className="text-center">
            <a 
              href="/reset-password" 
              className="font-medium text-primary-600 hover:text-primary-500 text-sm"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        )}
      </div>
    </div>
  );
}