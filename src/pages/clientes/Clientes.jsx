import React from 'react'
import './Clientes.css'
import ListClient from '../users/ListUser'

const clients = [
  {
    id: 1,
    nombreRazonSocial: "GASPAR",
    codigoTipoDocumentoIdentidad: 5,
    numeroDocumento: 3655579015,
    complemento: null,
    codigoCliente: "C-001",
    email: null
  }
];

const Clientes = () => {
  return (
    <main className='main-client'>
        <h1>Clientes</h1>
        <div className='main-cont-client'>
            <div className='left'>
                <h4>Clientes registrados</h4>
                <ListClient clients={clients} />
            </div>
            <div className='right'>
                
            </div>
        </div>            
    </main>
  )
}

export default Clientes