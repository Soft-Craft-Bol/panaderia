import React, { useState, useEffect,Suspense } from 'react'
import './LandingPage.css'
import loadImage from '../../assets/ImagesApp';
import panHD from '../../assets/img/panHD.jpg'; 
import inpased from '../../assets/img/inpased.png';
import pan6 from '../../assets/img/pan6.jpg';
import pan7 from '../../assets/img/pan7.jpg';
import pan10 from '../../assets/img/pan10.jpg';
import pan8 from '../../assets/img/pan8.jpg';
import pan5 from '../../assets/img/pan5.jpg';
import { Link } from 'react-router-dom';
import MapComponent from '../../components/map/MapComponent';

const LandingPage = () => {
    
    const useImageLoader = (imageName) => {
        const [image, setImage] = useState(null);
      
        useEffect(() => {
            loadImage(imageName).then((img) => setImage(img.default));
        }, [imageName]);
      
        return image;
    };

    const panHD = useImageLoader("producto");

  return (
    <main className="landing-page-body">
        <div className="landing">
			<div className="intro-text">
                <img src={inpased} alt="logo1" />
			</div>
		</div>
		<div className="features">
			<div className="container">
				<div className="feat">
					<i className="fas fa-magic fa-3x"></i>
					<h3>Cuéntanos tu idea</h3>
					<p>
						En Inpased, nos encanta conocer tus ideas para crear panes y productos únicos, hechos con amor y dedicación.
					</p>
				</div>
				<div className="feat">
					<i className="far fa-gem fa-3x"></i>
					<h3>Nosotros nos encargamos de todo</h3>
					<p>
						Deja todo en nuestras manos. Desde la selección de los mejores ingredientes hasta la elaboración de panes que te enamorarán.
					</p>
				</div>
				<div className="feat">
					<i className="fas fa-globe-asia fa-3x"></i>
					<h3>Tu pan es ahora internacional</h3>
					<p>
						Compartimos lo mejor de nuestra tradición panadera en cada rincón de Bolivia y el mundo.
					</p>
				</div>
			</div>
		</div>
		<div className="services" id="services">
			<div className="container">
				<h2 className="special-heading">Servicios</h2>
				<p>¡No pierdas tiempo, disfruta de lo mejor de la panadería!</p>
				<div className="services-content">
					<div className="col">
						<div className="srv">
							<i className="fas fa-palette fa-2x"></i>
							<div className="text">
								<h3>Diseño de Productos</h3>
								<p>
									Desde panes clásicos hasta creaciones especiales para eventos. Inpased ofrece una variedad increíble de productos hechos a medida.
								</p>
							</div>
						</div>
						<div className="srv">
							<i className="fab fa-sketch fa-2x"></i>
							<div className="text">
								<h3>Panadería a tu gusto</h3>
								<p>
									Creamos panadería personalizada para cada cliente. ¿Tienes una receta especial en mente? ¡Nosotros la hacemos realidad!
								</p>
							</div>
						</div>
					</div>
					<div className="col">
						<div className="srv">
							<i className="fas fa-vector-square fa-2x"></i>
							<div className="text">
								<h3>Pastelería artesanal</h3>
								<p>
									Elaboramos postres y productos de panadería de la más alta calidad, con la esencia de la tradición boliviana.
								</p>
							</div>
						</div>
						<div className="srv">
							<i className="fas fa-pencil-ruler fa-2x"></i>
							<div className="text">
								<h3>Servicio para eventos</h3>
								<p>
									Si tienes un evento especial, Inpased tiene el menú perfecto para ti. Desde panes para todo público hasta pasteles para ocasiones especiales.
								</p>
							</div>
						</div>
					</div>
					<div className="col">
						<div className="image image-column img-pan3">
							<img className='img-pan4' src={panHD} alt="" />
						</div>
					</div>
				</div>
			</div>
		</div>
		<div className="portfolio" id="portfolio">
			<div className="container">
				<h2 className="special-heading   our-product">Nuestros Productos</h2>
				<p className='subtittle'>Te brindamos la mejor calidad, hecha con amor.</p>
				<div className="portfolio-content">
                    <div className="card">
						<img src={pan10} alt="" />
						<div className="info">
							<h3>Pan Integral Especial</h3>
							<p>
								Disfruta del sabor auténtico del pan integral, hecho con harina de la mejor calidad. Perfecto para el desayuno o una merienda saludable.
							</p>
						</div>
					</div>
					<div className="card">
						<img src={pan6} alt="" />
						<div className="info">
							<h3>Pan de Leche Suave</h3>
							<p>
								Un pan tierno, suave y esponjoso, hecho con leche fresca y los mejores ingredientes. Ideal para cualquier momento del día.
							</p>
						</div>
					</div>
					<div className="card">
						<img src={pan7} alt="" />
						<div className="info">
							<h3>Empanada de Pollo</h3>
							<p>
								La clásica empanada de pollo, rellena con ingredientes frescos y una masa crujiente, ¡es el bocado perfecto para llevar!
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div className="about">
        <div className="container">
          <h2 className="special-heading">Encuéntranos</h2>
          <p>Visítanos en nuestras sucursales</p>
          <div className="about-content">
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', width: '100%' }} className='map-cont'>
            	<MapComponent coordinates={[-17.391960268184448, -66.15505311330328]} zoom={16} direccion={"Villa Armonía, La Paz"}/>
				<p>En el corazón de Villa Armonía, te esperamos con nuestros panes recién horneados.</p>
            </div>
			<div style={{ display: 'flex', gap: '20px', marginTop: '20px', width: '100%' }} className='map-cont'>
            	<MapComponent coordinates={[-17.386113530324913, -66.16078969825845]} zoom={16} direccion= {"Héroes del Chaco, La Paz"}/>
				<p>Visítanos en Héroes del Chaco, donde el sabor y la frescura se encuentran.</p>
            </div>
          </div>
        </div>
      </div>
    
		<div className="footer">
			&copy; 2025 <span
                ><Link to="https://www.softcraftbol.com/">SoftCraft</Link></span>
            Todos los derechos reservados
		</div>
	</main>
  )
}

export default LandingPage
