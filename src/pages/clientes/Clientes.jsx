import React from 'react'
import './Clientes.css'
import ListClient from '../users/ListClient'
import ImagesApp from '../../assets/ImagesApp';

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
                <ListClient />
            </div>
        </div>            
    </main>
  )
}

export default Clientes