import React, { Suspense, useEffect, useState, lazy, memo } from 'react';
import './Inicio.css';
import loadImage from "../../assets/ImagesApp"; 

const TopCard = lazy(() => import('../../components/topCard/TopCard'));
const InfoLayer = lazy(() => import('../../components/layer/InfoLayer'));
const Chard = lazy(() => import('../../components/chard/Chard'));

const data = [
  { id: 1, name: 'Pan francés', grade: 1, quantity: '1 unidad', price: 'Bs. 1.50', location: 'La Paz', timeline: 'Febrero 2025' },
  { id: 2, name: 'Celiaquía (pan sin gluten)', grade: 2, quantity: '1 unidad', price: 'Bs. 8.00', location: 'Santa Cruz', timeline: 'Febrero 2025' },
  { id: 3, name: 'Empanada de carne', grade: 3, quantity: '1 unidad', price: 'Bs. 6.00', location: 'Cochabamba', timeline: 'Febrero 2025' },
  { id: 4, name: 'Torta de chocolate', grade: 4, quantity: '1 pieza (aprox. 500g)', price: 'Bs. 30.00', location: 'Sucre', timeline: 'Enero 2025' },
  { id: 5, name: 'Bollos con queso', grade: 5, quantity: '1 unidad', price: 'Bs. 3.50', location: 'Oruro', timeline: 'Febrero 2025' },
];

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
              <Chard data={data} />
            </Suspense>
          </div>
          <div className='ventas'>
            <h3>Ventas de hoy</h3>
            <Suspense fallback={<p>Cargando gráfico...</p>}>
              <Chard data={data} />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Inicio;