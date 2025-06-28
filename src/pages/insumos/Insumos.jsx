import React, { useState, useEffect } from 'react';
import './Insumos.css';
import Card from '../../components/card/cards/Card';
import { getActivos, desactivarInsumo, activarInsumo, getSucursales } from '../../service/api';
import Modal from '../../components/modal/Modal';
import { useNavigate } from 'react-router-dom';
import { CurveModifier } from '@react-three/drei';
import SelectPrimary from '../../components/selected/SelectPrimary';

const Insumos = () => {
  const [insumos, setInsumos] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);
  const [selectedInsumo, setSelectedInsumo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const fetchInsumos = async () => {
    try {
      const response = await getActivos();
      setInsumos(response.data.content);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching insumos:', error);
      setError(error);
      setLoading(false);
    }
  };

  const fetchSucursales = async () => {
    try {
      const response = await getSucursales();
      setSucursales(response.data);
      setLoading(false);
      if (response.data.length > 0) {
        setSucursalSeleccionada(response.data[0].id);
      }

    } catch (error) {
      console.error('Error fetching insumos:', error);
      setError(error);
      setLoading(false);
    }
  };

  const handleDesactivar = async (id) => {
    try {
      await desactivarInsumo(id);
      fetchInsumos();
    } catch (error) {
      console.error('Error desactivando insumo:', error);
    }
  };

  const handleActivar = async (id) => {
    try {
      await activarInsumo(id);
      fetchInsumos();
    } catch (error) {
      console.error('Error activando insumo:', error);
    }
  };

  const openModal = (insumo) => {
    setSelectedInsumo(insumo);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedInsumo(null);
  };

  useEffect(() => {
    fetchInsumos();
    fetchSucursales();
  }, []);

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">Error al cargar los insumos</div>;

  return (
    <main className='main-insumos'>
      <h1>Insumos</h1>
      <div className="insumos-actions">
        <button className='btn-general' onClick={() => navigate('/insumos/crear')}>
          Crear insumo
        </button>
        <button className='btn-general secondary' onClick={() => navigate('/insumos/inactivos')}>
          Ver inactivos
        </button>
        <select
          value={sucursalSeleccionada || ''}
          onChange={(e) => setSucursalSeleccionada(Number(e.target.value))}
          className="select-sucursal"
        >
          <option value="" disabled hidden>
            Seleccione una sucursal
          </option>
          {sucursales.map((sucursal) => (
            <option key={sucursal.id} value={sucursal.id}>
              {sucursal.nombre}
            </option>
          ))}
        </select>
      </div>
      
      <div className="cards-container">
      {insumos.map((insumo) => (
  <Card
    key={insumo.id}
    img={insumo.imagen}
    titulo={insumo.nombre}
    sucursalId={1}
    datos={{
      Proveedor: insumo.proveedor,
      Marca: insumo.marca,
      'Precio': insumo.precioActual != null
        ? `Bs ${Number(insumo.precioActual).toFixed(2)}`
        : 'Precio no disponible'
    }}
    insumoId={insumo.id}
    insumoData={insumo}
    fetchSucursalesConInsumos={fetchInsumos}
    showDeleteButton={true}
    onDelete={() => handleDesactivar(insumo.id)}
  />
))}
      </div>
    </main>
  );
};

export default Insumos;