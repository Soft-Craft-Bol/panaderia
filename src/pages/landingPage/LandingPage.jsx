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
					<h3>Tell Us Your Idea</h3>
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing
						elit, sed do eiusmod tempor incididunt ut lab
					</p>
				</div>
				<div className="feat">
					<i className="far fa-gem fa-3x"></i>
					<h3>We Will Do All The Work</h3>
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing
						elit, sed do eiusmod tempor incididunt ut lab
					</p>
				</div>
				<div className="feat">
					<i className="fas fa-globe-asia fa-3x"></i>
					<h3>Your Product is Worldwide</h3>
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing
						elit, sed do eiusmod tempor incididunt ut lab
					</p>
				</div>
			</div>
		</div>
		<div className="services" id="services">
			<div className="container">
				<h2 className="special-heading">Services</h2>
				<p>Don't be busy, be productive</p>
				<div className="services-content">
					<div className="col">
						<div className="srv">
							<i className="fas fa-palette fa-2x"></i>
							<div className="text">
								<h3>Graphic Design</h3>
								<p>
									Graphic design is the process of visual
									communication and problem-solving using
									one or more of typography, photography
									and illustration.
								</p>
							</div>
						</div>
						<div className="srv">
							<i className="fab fa-sketch fa-2x"></i>
							<div className="text">
								<h3>UI & UX</h3>
								<p>
									Process of enhancing user satisfaction
									with a product by improving the
									usability, accessibility, and pleasure
									provided in the interaction.
								</p>
							</div>
						</div>
					</div>
					<div className="col">
						<div className="srv">
							<i className="fas fa-vector-square fa-2x"></i>
							<div className="text">
								<h3>Web Design</h3>
								<p>
									Web design encompasses many different
									skills and disciplines in the
									production and maintenance of websites.
								</p>
							</div>
						</div>
						<div className="srv">
							<i className="fas fa-pencil-ruler fa-2x"></i>
							<div className="text">
								<h3>Web Development</h3>
								<p>
									Web development is a broad term for the
									work involved in developing a web site
									for the Internet or an intranet.
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
				<p className='subtittle'>Te brindamos la mejor calidad.</p>
				<div className="portfolio-content">
                    <div className="card">
						<img src={pan10} alt="" />
						<div className="info">
							<h3>Project Here</h3>
							<p>
								My creative ability is very difficult to
								measure because it can manifest in so many
								surprising and.
							</p>
						</div>
					</div>
					<div className="card">
						<img src={pan6} alt="" />
						<div className="info">
							<h3>Project Here</h3>
							<p>
								My creative ability is very difficult to
								measure because it can manifest in so many
								surprising and.
							</p>
						</div>
					</div>
					<div className="card">
						<img src={pan7} alt="" />
						<div className="info">
							<h3>Project Here</h3>
							<p>
								My creative ability is very difficult to
								measure because it can manifest in so many
								surprising and.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div className="about">
			<div className="container">
				<h2 className="special-heading">About</h2>
				<p>Less is more work</p>
				<div className="about-content">
					<div className="image">
						<img className='img-about' src={pan5} alt="" />
					</div>
					<div className="text">
						<p>
							Lorem ipsum dolor sit amet consectetur
							adipisicing elit. Nihil nemo neque voluptate
							tempora velit cum non, fuga vitae architecto
							delectus sed maxime rerum impedit aliquam
							obcaecati, aut excepturi iusto laudantium!
						</p>
						<hr />
						<p>
							Lorem ipsum dolor sit amet consectetur
							adipisicing elit. Minus, sapiente. Velit iure
							exercitationem dolores nesciunt dolore. Eum
							officiis dolorum hic voluptate quaerat minima,
							similique inventore esse, alias, sed quo
							officia?
						</p>
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
