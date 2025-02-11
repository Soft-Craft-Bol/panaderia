import React, { useEffect, useState } from 'react';
import { getSucursales } from '../../service/api';
import CardSucursal from '../../components/cardProducto/cardSucursal';

const Sucursales = () => {
    const [sucursales, setSucursales] = useState([]);

    useEffect(() => {
        const fetchSucursales = async () => {
            try {
                const response = await getSucursales();
                setSucursales(response.data);
            } catch (error) {
                console.error('Error fetching sucursales:', error);
            }
        };

        fetchSucursales();
    }, []);

    const dataLabels = {
        data1: 'Departamento:',
        data2: 'Municipio:',
        data3: 'Dirección:',
        data4: 'Teléfono:',
        data5: 'Empresa:'
    };

    return (
        <div>
            <h1>Sucursales</h1>
            <div className="sucursales-list">
                {sucursales.map(sucursal => (
                    <CardSucursal 
                        key={sucursal.id} 
                        dataLabels={dataLabels} 
                        product={sucursal} 
                        onEliminar={() => console.log(`Eliminar sucursal ${sucursal.id}`)} 
                    />
                ))}
            </div>
        </div>
    );
};

export default Sucursales;