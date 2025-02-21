import React from 'react'
import './Clientes.css'
import ListClient from '../users/ListClient'

const Clientes = () => {
  return (
    <main className='main-client'>
        <h1>Clientes</h1>
        <div className='main-cont-client'>
            <div className='left'>
                <ListClient />
            </div>
        </div>            
    </main>
  )
}

export default Clientes