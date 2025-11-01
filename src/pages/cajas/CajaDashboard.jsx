import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../utils/authFunctions';
import AperturaCajaForm from './AperturaCajaForm';
import CierreCajaForm from './CierreCajaForm';
import CajaResumen from './CajaResumen';
import Table from '../../components/table/Table';
import { useHistorialCajas, useCajaActiva } from '../../hooks/useHistorialCajas';
import { abrirCaja } from '../../service/api';
import { toast, Toaster } from 'sonner';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import Modal from '../../components/modal/Modal';
import ActionButtons from '../../components/buttons/ActionButtons';
import CajaDetail from './CajaDetail';
import FiltersPanel from '../../components/search/FiltersPanel';

const CajaDashboard = () => {
  const [showAperturaForm, setShowAperturaForm] = useState(false);
  const [showCierreForm, setShowCierreForm] = useState(false);
  const [buscar, setBuscar] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedCajaId, setSelectedCajaId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    desde: null,
    hasta: null,
  });

  const currentUser = getUser();
  const navigate = useNavigate();

  const {
    data: cajaActiva,
    isLoading: isLoadingCaja,
    refetch: refetchCaja
  } = useCajaActiva(currentUser?.id);

  const noCajaAbierta =
    !cajaActiva || cajaActiva?.mensaje === "No tienes caja abierta actualmente.";

  const formatFechaDesde = filters.desde ? `${filters.desde}T00:00:00` : null;
  const formatFechaHasta = filters.hasta ? `${filters.hasta}T23:59:59` : null;

const { data: historialData, isLoading: isLoadingHistorial } = useHistorialCajas({
  userId: currentUser?.id,
  desde: buscar ? formatFechaDesde : null,
  hasta: buscar ? formatFechaHasta : null,
  page,
  size: rowsPerPage,
  enabled: !!currentUser?.id,
});

  const handleViewCaja = (cajaId) => {
    setSelectedCajaId(cajaId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCajaId(null);
  };

  const handleAbrirCaja = useCallback(async ({ montoInicial, turno }) => {
    try {
      await abrirCaja({
        usuarioId: currentUser.id,
        montoInicial,
        turno,
        sucursalId: currentUser.sucursal[0]?.id || null,
        puntoVentaId: currentUser.puntosVenta[0]?.id || null,
      });
      toast.success('Caja abierta correctamente');
      setShowAperturaForm(false);
      refetchCaja();
    } catch (err) {
      console.error('Error al abrir caja:', err);
      toast.error(`Error al abrir caja: ${err.response?.data || err.message}`);
    }
  }, [currentUser, refetchCaja]);

  const handleCierreExitoso = useCallback(() => {
    setShowCierreForm(false);
    refetchCaja();
    //refetchHistorial(); 
  }, [refetchCaja]);

  const filtersConfig = [
    {
      type: 'date',
      name: 'desde',
      label: 'Desde',
      placeholder: 'Seleccione fecha inicial',
    },
    {
      type: 'date',
      name: 'hasta',
      label: 'Hasta',
      placeholder: 'Seleccione fecha final',
    },
  ];

  const columnas = useMemo(() => [
    {
      header: 'ID Caja',
      accessor: 'id'
    },
    {
      header: 'Nombre Caja',
      accessor: 'nombre'
    },
    {
      header: 'Sucursal',
      accessor: 'sucursal'
    },
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
    { header: 'Usuario', accessor: 'usuarioApertura' },
    {
      header: 'Acciones',
      accessor: 'actions',
      render: (row) => (
        <ActionButtons
          onView={() => handleViewCaja(row.id)}
          showView={true}
          showEdit={false}
          showDelete={false}
        />
      )
    }
  ], []);

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  return (
    <div className="caja-dashboard">
      <Toaster position="top-right" richColors />
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

      <Modal
        isOpen={showAperturaForm}
        onClose={() => setShowAperturaForm(false)}
        title="Abrir Caja"
        size="md"
      >
        <AperturaCajaForm
          puntoVenta={currentUser.puntosVenta[0]}
          onAbrir={handleAbrirCaja}
          onCancelar={() => setShowAperturaForm(false)}
        />
      </Modal>

      <Modal
        isOpen={showCierreForm}
        onClose={() => setShowCierreForm(false)}
        title="Cerrar Caja"
        size="lg"
      >
        {showCierreForm && cajaActiva && (
          <CierreCajaForm
            caja={cajaActiva}
            usuario={currentUser}
            onCancelar={() => setShowCierreForm(false)}
            onCierreExitoso={handleCierreExitoso}
          />
        )}
      </Modal>

      <FiltersPanel
        filtersConfig={filtersConfig}
        filters={filters}
        onFilterChange={(newFilter) => {
          setFilters(prev => ({ ...prev, ...newFilter }));
          setBuscar(true);
        }}
        onResetFilters={() => {
          setFilters({ desde: null, hasta: null });
          setBuscar(false);
        }}
        layout="grid"
      />

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
      <CajaDetail
        cajaId={selectedCajaId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default CajaDashboard;