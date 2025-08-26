import { Link } from 'react-router-dom';

const NoPermission = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso denegado</h1>
        <p className="text-gray-700 mb-6">
          No tienes los permisos necesarios para acceder a esta sección.
        </p>
        <Link
          to="/home"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default NoPermission;