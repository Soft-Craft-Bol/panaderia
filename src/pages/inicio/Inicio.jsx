import React, { Suspense, useMemo, useCallback, lazy, memo } from 'react';
import './Inicio.css';
import loadImage from "../../assets/ImagesApp"; 
import { getStats, getVentasPorDia } from '../../service/api';
import { useQuery } from '@tanstack/react-query';
import ChartComponent from '../../components/grafico/Grafico';
import { useNavigate } from "react-router";
import ScrollToTop from '../../components/loading/ScrollToTop';

const TopCard = lazy(() => import('../../components/topCard/TopCard'));
const InfoLayer = lazy(() => import('../../components/layer/InfoLayer'));
const Chard = lazy(() => import('../../components/chard/Chard'));
const ItemChard = lazy(() => import('../../components/chard/ItemChard'));

const FaMapPin = lazy(() => import("react-icons/fa").then(mod => ({ default: mod.FaMapPin })));
const FaSellsy = lazy(() => import("react-icons/fa").then(mod => ({ default: mod.FaSellsy })));
const FaHouseUser = lazy(() => import("react-icons/fa").then(mod => ({ default: mod.FaHouseUser })));
const FaPersonBooth = lazy(() => import("react-icons/fa").then(mod => ({ default: mod.FaPersonBooth })));
const FaBreadSlice = lazy(() => import("react-icons/fa").then(mod => ({ default: mod.FaBreadSlice })));

const MemoizedTopCard = memo(({ title, quantity, porcentaje, Icon }) => (
  <Suspense fallback={<p>Cargando {title}...</p>}>
    <TopCard title={title} quantity={quantity} porcentaje={porcentaje} Icon={Icon} />
  </Suspense>
));

const useImageLoader = (imageName) => {
  const [image, setImage] = React.useState(null);
  React.useEffect(() => {
    loadImage(imageName).then((img) => setImage(img.default));
  }, [imageName]);
  return image;
};

const Inicio = () => {
  const navigate = useNavigate();

  const sucursalImg = useImageLoader("sucursal");
  const maquinasImg = useImageLoader("maquinas");
  const inventarioImg = useImageLoader("inventario");

  const { data: stats = {}, isLoading: loadingStats } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
    select: (data) => data.data
  });



  const { data: ventasPorDia = [], isLoading: loadingVentas } = useQuery({
    queryKey: ['ventasPorDia'],
    queryFn: getVentasPorDia,
    select: (data) => data.data
  });

  const ventasData = useMemo(() => 
    ventasPorDia.map(item => ({
      time: item.fecha,
      value: item.total
    })),
    [ventasPorDia]
  );

  const handleNavigate = useCallback((isInventario) => {
    return () => navigate(isInventario ? "/productos" : "/clientes");
  }, [navigate]);

  const loading = loadingStats || loadingVentas;

  return (
    <main className='main-cont-inicio'>
        <>
          <div className='info-cont'>
            <MemoizedTopCard title="Pts de Venta" quantity={stats.numeroPuntosVenta} Icon={FaMapPin} />
            <MemoizedTopCard title="Ingresos" quantity={stats.totalVentasHoy} porcentaje="Bs." Icon={FaSellsy} />
            <MemoizedTopCard title="Nro Usuarios" quantity={stats.numeroUsuarios} Icon={FaHouseUser} />
            <MemoizedTopCard title="Clientes" quantity={stats.clientesRegistrados} Icon={FaPersonBooth} />
            <MemoizedTopCard title="Nro Panaderos" quantity={stats.totalPanaderos} Icon={FaBreadSlice} />
          </div>
          <section className='tot-cont'>
            <div className='left'>
              <Suspense fallback={<ScrollToTop/>}>
                {sucursalImg && (
                  <InfoLayer
                    title="Sucursales"
                    description="Total de sucursales"
                    total={stats.numeroSucursales}
                    image={sucursalImg}
                  />
                )}
                {maquinasImg && (
                  <InfoLayer
                    title="Inventario"
                    description="Producto a ofrecer"
                    total={stats.inventario}
                    image={maquinasImg}
                  />
                )}
                {inventarioImg && (
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
                <h3>Ventas por día</h3>
                <ChartComponent data={ventasData} />
              </div>
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
        </>
    </main>
  );
};

export default Inicio;
