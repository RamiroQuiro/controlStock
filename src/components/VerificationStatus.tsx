import { useEffect, useState } from 'react';

interface VerificationStatusProps {
  token: string;
}

export const VerificationStatus = ({ token }: VerificationStatusProps) => {
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>(
    'pending'
  );
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/confirmacion/${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          // Redirigir después de 3 segundos
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 3000);
        } else {
          setStatus('error');
          setErrorMessage(data.msg || 'Error en la verificación');
        }
      } catch (error) {
        setStatus('error');
        setErrorMessage('Error al conectar con el servidor');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        {status === 'pending' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Verificando tu correo electrónico
            </h1>
            <p className="text-gray-600 text-2xl animate-pulse mb-6">
              Por favor espera mientras verificamos tu cuenta...
            </p>
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-primary-500 rounded-full animate-progress"></div>
              </div>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              ¡Email verificado con éxito!
            </h1>
            <p className="text-gray-600 mb-6">
              Serás redirigido al dashboard...
            </p>
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-primary-500 rounded-full animate-progress"></div>
              </div>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-500 text-6xl mb-4">✕</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Error en la verificación
            </h1>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <a
              href="/login"
              className="text-primary-500 text-xl hover:underline"
            >
              Volver al login
            </a>
            <a
              href="/login"
              className="text-primary-400 text-2xl hover:underline"
            >
              Volver a mandar codigo
            </a>
          </>
        )}
      </div>
    </div>
  );
};
