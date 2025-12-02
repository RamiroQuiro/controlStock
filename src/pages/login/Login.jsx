import React, { useState } from "react";
import { Lock, Mail, User, LogIn, UserPlus } from "lucide-react";
import Formulario from "./Formulario";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-xl h-[500px] shadow-xl rounded-xl p-8 border  ">
      <div className="text-center">
        <h2 className="mt-6 text-2xl font-extrabold  text-primary-100">
          {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {isLogin
            ? "¡Bienvenido de nuevo!"
            : "Regístrate para acceder a tu panel"}
        </p>
      </div>

      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`
                px-4 py-2 text-sm font-medium 
                ${
                  isLogin
                    ? "bg-primary-500 "
                    : "bg-white text-gray-400 hover:bg-gray-100"
                }
                border border-gray-200 rounded-l-lg duration-200
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
                ${
                  !isLogin
                    ? "bg-primary-500"
                    : "bg-white text-gray-400 hover:bg-gray-100"
                }
                border-t border-b border-r border-gray-200 rounded-r-lg duration-200
              `}
          >
            <UserPlus className="inline-block mr-2" size={18} />
            Registrarse
          </button>
        </div>
      </div>
      <Formulario isLogin={isLogin} />

      {isLogin && (
        <div className="text-center flex flex-col gap-2 mt-4">
          <a
            href="/reset-password"
            className="font-medium text-primary-600 hover:text-primary-500 text-sm"
          >
            ¿Olvidaste tu contraseña?
          </a>
          <a
            href="/reenviar-confirmacion"
            className="font-medium text-gray-500 hover:text-gray-700 text-xs"
          >
            ¿No recibiste el email de confirmación?
          </a>
        </div>
      )}
    </div>
  );
}
