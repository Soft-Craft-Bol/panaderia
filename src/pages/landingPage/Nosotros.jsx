import React from 'react';
import './Nosotros.css';

const Nosotros = () => {
  return (
    <section className="nosotros-container" id="nosotros">
      <div className="nosotros-header">
        <h2>Nuestra Historia</h2>
        <div className="divider"></div>
      </div>

      <div className="nosotros-content">
        <div className="nosotros-text">
          <p>
            En <span className="highlight">Panadería Delicias</span>, horneamos tradición desde 1985. 
            Lo que comenzó como un pequeño horno familiar en el corazón del barrio, 
            hoy se ha convertido en un referente de calidad y sabor auténtico.
          </p>
          
          <h3>Nuestra Filosofía</h3>
          <ul className="values-list">
            <li>
              <span className="icon">🥖</span>
              <span>Ingredientes 100% naturales</span>
            </li>
            <li>
              <span className="icon">👨‍🍳</span>
              <span>Recetas artesanales heredadas</span>
            </li>
            <li>
              <span className="icon">❤️</span>
              <span>Amor en cada preparación</span>
            </li>
            <li>
              <span className="icon">🏡</span>
              <span>Atención familiar y personalizada</span>
            </li>
          </ul>
        </div>

        <div className="nosotros-image">
          <div className="image-frame">
            {/* Aquí iría tu imagen de la panadería */}
            <div className="placeholder-image">🍞</div>
          </div>
        </div>
      </div>

      <div className="team-section">
        <h3>Conoce a nuestro equipo</h3>
        <div className="team-members">
          <div className="member">
            <div className="member-photo">👨‍🍳</div>
            <h4>Juan Pérez</h4>
            <p>Maestro panadero</p>
          </div>
          <div className="member">
            <div className="member-photo">👩‍🍳</div>
            <h4>María Gómez</h4>
            <p>Pastelera principal</p>
          </div>
          <div className="member">
            <div className="member-photo">👨</div>
            <h4>Carlos Rojas</h4>
            <p>Atención al cliente</p>
          </div>
        </div>
      </div>

      <div className="visit-us">
        <button className="btn-general">Visítanos hoy</button>
      </div>
    </section>
  );
};

export default Nosotros;