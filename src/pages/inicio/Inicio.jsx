import React, { Suspense, useEffect, useState, lazy, memo } from 'react';
import './Inicio.css';
import loadImage from "../../assets/ImagesApp"; 
import { getItemsLimited, getStats } from '../../service/api';
const TopCard = lazy(() => import('../../components/topCard/TopCard'));
const InfoLayer = lazy(() => import('../../components/layer/InfoLayer'));
const Chard = lazy(() => import('../../components/chard/Chard'));
const ItemChard = lazy(() => import('../../components/chard/ItemChard'));
import { useNavigate } from "react-router";

const useImageLoader = (imageName) => {
  const [image, setImage] = useState(null);

  useEffect(() => {
    loadImage(imageName).then((img) => setImage(img.default));
  }, [imageName]);

  return image;
};

const MemoizedTopCard = memo(({ title, quantity, porcentaje }) => (
  <Suspense fallback={<p>Cargando {title}...</p>}>
    <TopCard title={title} quantity={quantity} porcentaje={porcentaje} />
  </Suspense>
));

const Inicio = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    numeroSucursales: 0,
    inventario: 0,
    facturasEmitidasHoy: 0
  });
  const [loading, setLoading] = useState(true);

  const sucursalImg = useImageLoader("sucursal");
  const maquinasImg = useImageLoader("maquinas");
  const inventarioImg = useImageLoader("inventario");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getStats();
        console.log('response:', response);
        if (response && response.data) {
          setStats(response.data);
        } else {
          console.error('sin datos');
        }
      } catch (error) {
        console.error('error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleNavigate = (isInventario) => {
    return () => {
      navigate(isInventario ? "/productos" : "/clientes");
    };
  };

  return (
    <main className='main-cont-inicio'>
      <div className='info-cont'>
        <MemoizedTopCard title="Ingresos" quantity="1500" porcentaje="10%" />
        <MemoizedTopCard title="Egresos" quantity="1500" porcentaje="10%" />
        <MemoizedTopCard title="Costo Prod" quantity="1500" porcentaje="10%" />
        <MemoizedTopCard title="Otros" quantity="1500" porcentaje="10%" />
      </div>
      <section className='tot-cont'>
        <div className='left'>
          <Suspense fallback={<p>Cargando imagen...</p>}>
            {!loading && sucursalImg && (
              <InfoLayer 
                title="Sucursales" 
                description="Total de sucursales" 
                total={stats.numeroSucursales} 
                image={sucursalImg} 
              />
            )}
            {!loading && maquinasImg && (
              <InfoLayer 
                title="Inventario" 
                description="Inventario de maquinas" 
                total={stats.inventario} 
                image={maquinasImg} 
              />
            )}
            {!loading && inventarioImg && (
              <InfoLayer 
                title="Productos" 
                description="Productos vendidos hoy" 
                total={stats.facturasEmitidasHoy} 
                image={inventarioImg} 
              />
            )}
          </Suspense>
        </div>
        <div className='rigth'>
          <div className='inventario'>
            <h3>Inventario</h3>
            <Suspense fallback={<p>Cargando gráfico...</p>}>
              <ItemChard />
            </Suspense>
            <p className='see-more' onClick={handleNavigate(true)}>
              Ver más...
            </p>
          </div>
          <div className='ventas'>
            <h3>Clientes</h3>
            <Suspense fallback={<p>Cargando gráfico...</p>}>
              <Chard />
            </Suspense>
            <p className='see-more' onClick={handleNavigate(false)}>
              Ver más...
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Inicio;