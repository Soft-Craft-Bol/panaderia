import React, { useState, useEffect } from 'react';
import './Insumos.css';
import Card from '../../components/card/cards/Card';
import { getActivos, desactivarInsumo, activarInsumo, getSucursales, insumoPorSucursal } from '../../service/api';
import Modal from '../../components/modal/Modal';
import { useNavigate } from 'react-router-dom';
import { CurveModifier } from '@react-three/drei';
import SelectPrimary from '../../components/selected/SelectPrimary';
import InsumosPorSucursal from '../../components/insumos/InsumosPorSucursal';

const Insumos = () => {
  const [insumos, setInsumos] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);
  const [insumosSucursal, setInsumosSucursal] = useState([]);
  const [selectedInsumo, setSelectedInsumo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const fetchInsumos = async () => {
    try {
      const response = await getActivos();
      console.log(response.data.content);
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
        fetchInsumosPorSucursal(response.data[0].id);
      }

    } catch (error) {
      console.error('Error fetching insumos:', error);
      setError(error);
      setLoading(false);
    }
  };

  const fetchInsumosPorSucursal = async (id) => {
  try {
    const response = await insumoPorSucursal(id);
    setInsumosSucursal(response.data);
  } catch (error) {
    console.error('Error al cargar insumos por sucursal:', error);
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
        {/* <button className='btn-general secondary' onClick={() => navigate('/insumos/inactivos')}>
          Ver inactivos
        </button> */}
        <select
          value={sucursalSeleccionada || ''}
          onChange={(e) => {
            const id = Number(e.target.value);
            setSucursalSeleccionada(id);
            fetchInsumosPorSucursal(id);
          }}
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
      
      <div className="">
      <h2>Insumos de la sucursal</h2>
        <InsumosPorSucursal insumos={insumosSucursal} />
      </div>
    </main>
  );
};

export default Insumos;