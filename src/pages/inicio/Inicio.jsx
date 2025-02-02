import React from 'react'
import TopCard from '../../components/topCard/TopCard'
import './Inicio.css'
const Inicio = () => {
  return (
    <>
    <div className='info-cont'>
        <TopCard title="Ingresos" quantity="1500" porcentaje="10%"/>
        <TopCard title="Egresos" quantity="1500" porcentaje="10%"/>
        <TopCard title="Costo Prod" quantity="1500" porcentaje="10%"/>
        <TopCard title="Otros" quantity="1500" porcentaje="10%"/>
    </div>
    
    </>
    
  )
}

export default Inicio