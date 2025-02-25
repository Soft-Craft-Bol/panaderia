import React, { Suspense, useEffect, useState, lazy, memo } from 'react';
import './Inicio.css';
import loadImage from "../../assets/ImagesApp"; 
import { getItemsLimited, getStats } from '../../service/api';
const TopCard = lazy(() => import('../../components/topCard/TopCard'));
const InfoLayer = lazy(() => import('../../components/layer/InfoLayer'));
const Chard = lazy(() => import('../../components/chard/Chard'));
const ItemChard = lazy(() => import('../../components/chard/ItemChard'));
import { createChart, LineSeries } from 'lightweight-charts';
import ChartComponent from '../../components/grafico/Grafico';
import { useNavigate } from "react-router";

const FaCalendarWeek = lazy(() => import("react-icons/fa").then(mod => ({ default: mod.FaCalendarWeek })));
const FaMapPin = lazy(() => import("react-icons/fa").then(mod => ({ default: mod.FaMapPin })));
const FaHouseUser = lazy(() => import("react-icons/fa").then(mod => ({ default: mod.FaHouseUser })));
const FaSellsy = lazy(() => import("react-icons/fa").then(mod => ({ default: mod.FaSellsy })));
const FaPersonBooth = lazy(() => import("react-icons/fa").then(mod => ({ default: mod.FaPersonBooth })));
const FaBreadSlice = lazy(() => import("react-icons/fa").then(mod => ({ default: mod.FaBreadSlice })));

const useImageLoader = (imageName) => {
  const [image, setImage] = useState(null);

  useEffect(() => {
    loadImage(imageName).then((img) => setImage(img.default));
  }, [imageName]);

  return image;
};

const MemoizedTopCard = memo(({ title, quantity, porcentaje, Icon }) => (
  <Suspense fallback={<p>Cargando {title}...</p>}>
    <TopCard title={title} quantity={quantity} porcentaje={porcentaje} Icon={Icon} />
  </Suspense>
));

const Inicio = (props) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    numeroSucursales: 0,
    inventario: 0,
    facturasEmitidasHoy: 0,
    numeroPuntosVenta: 0,
    numeroUsuarios: 0,
    totalVentasHoy: 0.0,
    clientesRegistrados: 0,
    totalPanaderos: 0
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

  // Función para generar datos de ventas diarias durante un año
  const generateYearlyData = () => {
    const data = [];
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-12-31');
    const sucursales = ['Sucursal A', 'Sucursal B', 'Sucursal C'];

    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      const date = d.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      const randomValue = Math.floor(Math.random() * 2000) + 500; // Ventas entre 500 y 2500
      data.push({ time: date, value: randomValue });
    }

    return data;
  };

  // Datos estáticos para la gráfica de ventas diarias por sucursal durante un año
  const initialData = generateYearlyData();

  const handleNavigate = (isInventario) => {
    return () => {
      navigate(isInventario ? "/productos" : "/clientes");
    };
  };

  return (
    <main className='main-cont-inicio'>
      <div className='info-cont'>
        <MemoizedTopCard title="Pts de Venta" quantity={stats.numeroPuntosVenta} Icon={FaMapPin} />
        <MemoizedTopCard title="Ingresos" quantity={stats.totalVentasHoy} porcentaje="Bs." Icon={FaSellsy} />
        <MemoizedTopCard title="Nro Usuarios" quantity={stats.numeroUsuarios} Icon={FaHouseUser} />
        <MemoizedTopCard title="Clientes" quantity={stats.clientesRegistrados} Icon={FaPersonBooth} />
        <MemoizedTopCard title="Nro Panaderos" quantity={stats.totalPanaderos} Icon={FaBreadSlice} />
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
                description="Producto a ofrecer" 
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
            <h3>Gráficos de Ventas por Sucursal (Año 2023)</h3>
            <ChartComponent data={initialData} />
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
    </main>
  );
};

export default Inicio;