import React from 'react'
import TopCard from '../../components/topCard/TopCard'
import './Inicio.css'
import InfoLayer from '../../components/layer/InfoLayer'
import Chard from '../../components/chard/Chard'
import ImagesApp from '../../assets/ImagesApp'
import { Navigate, useNavigate } from 'react-router-dom'

const data = [
  { id: 1, name: 'Pan francés', grade: 1, quantity: '1 unidad', price: 'Bs. 1.50', location: 'La Paz', timeline: 'Febrero 2025' },
  { id: 2, name: 'Celiaquía (pan sin gluten)', grade: 2, quantity: '1 unidad', price: 'Bs. 8.00', location: 'Santa Cruz', timeline: 'Febrero 2025' },
  { id: 3, name: 'Empanada de carne', grade: 3, quantity: '1 unidad', price: 'Bs. 6.00', location: 'Cochabamba', timeline: 'Febrero 2025' },
  { id: 4, name: 'Torta de chocolate', grade: 4, quantity: '1 pieza (aprox. 500g)', price: 'Bs. 30.00', location: 'Sucre', timeline: 'Enero 2025' },
  { id: 5, name: 'Bollos con queso', grade: 5, quantity: '1 unidad', price: 'Bs. 3.50', location: 'Oruro', timeline: 'Febrero 2025' },
  { id: 5, name: 'Bollos con queso', grade: 5, quantity: '1 unidad', price: 'Bs. 3.50', location: 'Oruro', timeline: 'Febrero 2025' },
];

const Inicio = () => {
  const navigate = useNavigate();
  return (
    <main className='main-cont-inicio'>
    <div className='info-cont'>
        <TopCard title="Ingresos" quantity="1500" porcentaje="10%"/>
        <TopCard title="Egresos" quantity="1500" porcentaje="10%"/>
        <TopCard title="Costo Prod" quantity="1500" porcentaje="10%"/>
        <TopCard title="Otros" quantity="1500" porcentaje="10%"/>
    </div>
    <section className='tot-cont'>
        <div className='left'>
            <InfoLayer 
                title="Sucursales" 
                description="Total de sucursales" 
                total={5} 
                image={ImagesApp.sucursal}
            />
            <InfoLayer 
                title="Inventario" 
                description="Iventario de maquinas" 
                total={10} 
                image={ImagesApp.maquinas}
            />
            <InfoLayer 
                title="Productos" 
                description="Productos vendidos hoy" 
                total={2000} 
                image={ImagesApp.inventario}
            />
            <div>
              <button className='btn-general'
             onClick={() => navigate("/sucursales")}>
              Ver todas las sucursales
            </button>
            </div>
            
        </div>
        <div className='rigth'>
            <div className='inventario'>
              <h3>Inventario</h3>
              <Chard data={data} />

            </div>
            <div className='ventas'>
              <h3>Ventas de hoy</h3>
              <Chard data={data} />

            </div>
        </div>
    </section>
    </main>
    
  )
}

export default Inicio