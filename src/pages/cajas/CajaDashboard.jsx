import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../utils/authFunctions';
import AperturaCajaForm from './AperturaCajaForm';
import CierreCajaForm from './CierreCajaForm';
import CajaResumen from './CajaResumen';
import Table from '../../components/table/Table';
import { useHistorialCajas, useCajaActiva } from '../../hooks/useHistorialCajas';
import { abrirCaja, cerrarCaja } from '../../service/api';
import { toast, Toaster } from 'sonner';
import { debounce } from 'lodash';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import CustomDatePicker from '../../components/inputs/DatePicker';

const CajaDashboard = () => {
  const [showAperturaForm, setShowAperturaForm] = useState(false);
  const [showCierreForm, setShowCierreForm] = useState(false);
  const [buscar, setBuscar] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [desde, setDesde] = useState(null); // ahora será Date o null
  const [hasta, setHasta] = useState(null);

  const currentUser = getUser();
  const navigate = useNavigate();

  const {
    data: cajaActiva,
    isLoading: isLoadingCaja,
    refetch: refetchCaja
  } = useCajaActiva(currentUser?.id);

  const noCajaAbierta =
    !cajaActiva || cajaActiva?.mensaje === "No tienes caja abierta actualmente.";

  const formatFechaDesde = desde ? `${desde.toISOString().split("T")[0]}T00:00:00` : null;
  const formatFechaHasta = hasta ? `${hasta.toISOString().split("T")[0]}T23:59:59` : null;


  const {
    data: historialData,
    isLoading: isLoadingHistorial
  } = useHistorialCajas({
    userId: currentUser?.id,
    desde: buscar ? formatFechaDesde : null,
    hasta: buscar ? formatFechaHasta : null,
    page,
    size: rowsPerPage,
    enabled: !!currentUser?.id,
  });

  const debouncedSetBuscar = useCallback(
    debounce(() => setBuscar(true), 500),
    []
  );

  const handleAbrirCaja = useCallback(async ({ montoInicial, turno }) => {
    try {
      await abrirCaja({
        usuarioId: currentUser.id,
        montoInicial,
        turno,
        sucursalId: currentUser.puntosVenta[0]?.id,
      });
      toast.success('Caja abierta correctamente');
      setShowAperturaForm(false);
      refetchCaja();
    } catch (err) {
      toast.error(`Error al abrir caja: ${err.response?.data?.mensaje || err.message}`);
    }
  }, [currentUser, refetchCaja]);

  const handleCerrarCaja = useCallback(async (datosCierre) => {
    try {
      await cerrarCaja({
        cajaId: cajaActiva.id,
        ...datosCierre
      });
      toast.success('Caja cerrada correctamente');
      setShowCierreForm(false);
      refetchCaja();
    } catch (err) {
      toast.error(`Error al cerrar caja: ${err.response?.data?.mensaje || err.message}`);
    }
  }, [cajaActiva, refetchCaja]);

  const columnas = useMemo(() => [
    {
      header: 'Estado',
      accessor: 'estado',
      render: (row) => (
        <span className={`estado-badge ${row.estado.toLowerCase()}`}>
          {row.estado}
        </span>
      )
    },
    { header: 'Turno', accessor: 'turno' },
    {
      header: 'Monto Inicial',
      accessor: 'montoInicial',
      render: (row) => `Bs ${parseFloat(row.montoInicial).toFixed(2)}`
    },
    {
      header: 'Fecha Apertura',
      accessor: 'fechaApertura',
      render: (row) => new Date(row.fechaApertura).toLocaleString()
    },
    {
      header: 'Fecha Cierre',
      accessor: 'fechaCierre',
      render: (row) => row.fechaCierre ? new Date(row.fechaCierre).toLocaleString() : '-'
    },
    { header: 'Usuario', accessor: 'usuarioApertura.nombre' },
  ], []);

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  return (
    <div className="caja-dashboard">
      <Toaster position="top-right" richColors />
      <h1>Gestión de Cajas</h1>

      {isLoadingCaja ? (
        <div>Cargando estado de caja...</div>
      ) : noCajaAbierta ? (
        <div className="no-caja-aviso">
          <p>No tienes una caja abierta actualmente.</p>
          <ButtonPrimary onClick={() => setShowAperturaForm(true)}>
            Abrir Nueva Caja
          </ButtonPrimary>
        </div>
      ) : (
        <>
          <CajaResumen caja={cajaActiva} />
          <div className="caja-actions">
            <ButtonPrimary
              variant="danger"
              onClick={() => setShowCierreForm(true)}
              disabled={showCierreForm}
            >
              Cerrar Caja
            </ButtonPrimary>
          </div>
        </>
      )}

      {showAperturaForm && (
        <AperturaCajaForm
          puntoVenta={currentUser.puntosVenta[0]}
          onAbrir={handleAbrirCaja}
          onCancelar={() => setShowAperturaForm(false)}
        />
      )}

      {showCierreForm && cajaActiva && (
        <CierreCajaForm
          caja={cajaActiva}
          usuario={currentUser}
          onCerrar={handleCerrarCaja}
          onCancelar={() => setShowCierreForm(false)}
        />
      )}

      <div className="filtros-fecha">
        <div className="filter-group">
          <label>Desde:</label>
          <CustomDatePicker
            selected={desde}
            onChange={(date) => {
              setDesde(date);
              debouncedSetBuscar();
            }}
            maxDate={hasta}
            placeholderText="Seleccione fecha desde"
          />
        </div>

        <div className="filter-group">
          <label>Hasta:</label>
          <CustomDatePicker
            selected={hasta}
            onChange={(date) => {
              setHasta(date);
              debouncedSetBuscar();
            }}
            minDate={desde}
            placeholderText="Seleccione fecha hasta"
          />
        </div>

        <ButtonPrimary
          variant="secondary"
          onClick={() => {
            setDesde(null);
            setHasta(null);
            setBuscar(false);
          }}
        >
          Restablecer
        </ButtonPrimary>
      </div>


      {/* Tabla Historial */}
      <Table
        columns={columnas}
        data={historialData?.content || []}
        loading={isLoadingHistorial}
        pagination={{
          currentPage: page + 1,
          totalPages: historialData?.totalPages || 0,
          totalElements: historialData?.totalElements || 0,
          rowsPerPage: rowsPerPage
        }}
        onPageChange={(newPage) => setPage(newPage - 1)}
        onRowsPerPageChange={setRowsPerPage}
        showColumnVisibility={true}
        storageKey="historialCajasHiddenColumns"
        emptyMessage="No hay registros de cajas para mostrar"
      />
    </div>
  );
};

export default CajaDashboard;