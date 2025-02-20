import React, { Suspense, useEffect, useState, lazy, memo } from 'react';
import './Inicio.css';
import loadImage from "../../assets/ImagesApp"; 
import { getItemsLimited } from '../../service/api';
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

const handleNavigate = (isInventario) => {
  const navigate = useNavigate();
  return () => {
    navigate(isInventario ? "/productos" : "/clientes");
  };
};

const MemoizedTopCard = memo(({ title, quantity, porcentaje }) => (
  <Suspense fallback={<p>Cargando {title}...</p>}>
    <TopCard title={title} quantity={quantity} porcentaje={porcentaje} />
  </Suspense>
));

const Inicio = () => {
  const sucursalImg = useImageLoader("sucursal");
  const maquinasImg = useImageLoader("maquinas");
  const inventarioImg = useImageLoader("inventario");

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
            {sucursalImg && <InfoLayer title="Sucursales" description="Total de sucursales" total={5} image={sucursalImg} />}
            {maquinasImg && <InfoLayer title="Inventario" description="Inventario de maquinas" total={10} image={maquinasImg} />}
            {inventarioImg && <InfoLayer title="Productos" description="Productos vendidos hoy" total={2000} image={inventarioImg} />}
          </Suspense>
        </div>
        <div className='rigth'>
          <div className='inventario'>
            <h3>Inventario</h3>
            <Suspense fallback={<p>Cargando gráfico...</p>}>
              <ItemChard />
            </Suspense>
            <p className='see-more'
              onClick={handleNavigate(true)}
            >Ver más...</p>
          </div>
          <div className='ventas'>
            <h3>Clientes</h3>
            <Suspense fallback={<p>Cargando gráfico...</p>}>
              <Chard />
            </Suspense>
            <p className='see-more'
              onClick={handleNavigate(false)}
            >Ver más...</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Inicio;