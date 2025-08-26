import { useEffect, useMemo, useState } from 'react';
import { getUserById } from '../../service/api';
import { Toaster, toast } from 'sonner';
import './UserProfile.css';
import { getUser } from '../../utils/authFunctions';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
   const currentUser = useMemo(() =>  getUser(), []);
  const userId = currentUser?.id || 1; 

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await getUserById(userId);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
        toast.error('Error al cargar el perfil del usuario');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) {
    return <div className="profile-loading">Cargando perfil...</div>;
  }

  if (!user) {
    return <div className="profile-error">No se pudo cargar el perfil</div>;
  }

  const formatTime = (timeString) => {
    return timeString.slice(0, 5); // Convierte "07:00:00" a "07:00"
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div className="user-profile-container">
      <Toaster richColors position="top-right" />
      
      <div className="profile-header">
        <div className="profile-avatar-container">
          <img 
            src={user.photo || 'https://via.placeholder.com/150'} 
            alt={`Avatar de ${user.firstName}`} 
            className="profile-avatar"
          />
        </div>
        <div className="profile-basic-info">
          <h1>{user.firstName} {user.lastName}</h1>
          <p className="profile-username">@{user.username}</p>
          <div className="profile-roles">
            {user.roles.map((role, index) => (
              <span key={index} className="role-badge">{role}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          Información
        </button>
        <button 
          className={`tab-button ${activeTab === 'horarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('horarios')}
        >
          Horarios
        </button>
        <button 
          className={`tab-button ${activeTab === 'puntos' ? 'active' : ''}`}
          onClick={() => setActiveTab('puntos')}
        >
          Puntos de Venta
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'info' && (
          <div className="info-tab">
            <div className="info-item">
              <span className="info-label">Correo electrónico:</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Teléfono:</span>
              <span className="info-value">{user.telefono || 'No especificado'}</span>
            </div>
          </div>
        )}

        {activeTab === 'horarios' && (
          <div className="horarios-tab">
            {user.horarios.length === 0 ? (
              <p className="no-horarios">No hay horarios registrados</p>
            ) : (
              <div className="horarios-list">
                {user.horarios.map((horario, index) => (
                  <div key={index} className="horario-card">
                    <div className="horario-header">
                      <h3>Horario #{horario.id}</h3>
                      <span className="horario-dates">
                        {formatDate(horario.fechaEntrada)} - {formatDate(horario.fechaSalida)}
                      </span>
                    </div>
                    <div className="horario-times">
                      <span>{formatTime(horario.horaEntrada)} a {formatTime(horario.horaSalida)}</span>
                    </div>
                    <div className="horario-dias">
                      {horario.dias.map((dia, i) => (
                        <span key={i} className="dia-badge">{dia}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'puntos' && (
          <div className="puntos-tab">
            {user.puntosVenta.length === 0 ? (
              <p className="no-puntos">No hay puntos de venta asignados</p>
            ) : (
              <div className="puntos-list">
                {user.puntosVenta.map((punto, index) => (
                  <div key={index} className="punto-card">
                    <h3>{punto.nombre}</h3>
                    <span>ID: {punto.id}</span>
                    <br />
                    <span>NOMBRE: {punto.nombre}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;