import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getReservasByFilters } from "../../service/api";
import Table from "../../components/table/Table";
import Modal from "../../components/modal/Modal";
import { Toaster, toast } from "sonner";
import "./ReservasTable.css";
import SelectSecondary from "../../components/selected/SelectSecondary";
import CustomDatePicker from "../../components/inputs/DatePicker";
import { Button } from "../../components/buttons/Button";

const ReservasDetalleTable = () => {
    const [filters, setFilters] = useState({
        estado: "",
        desde: "",
        hasta: "",
    });

    const [selectedReserva, setSelectedReserva] = useState(null);

    const { data, isLoading, refetch } = useQuery({
  queryKey: ["reservasDetalle", filters],
  queryFn: () => getReservasByFilters(filters).then((res) => res.data),
  staleTime: 1000 * 60 * 5, // 5 minutos: evita refetch inmediato
  cacheTime: 1000 * 60 * 10, // 10 minutos en cache
  keepPreviousData: true, // mantiene los datos mientras carga nuevos
});


    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleApplyFilters = () => {
        refetch();
    };

    const handleShowReserva = (reserva) => setSelectedReserva(reserva);

    const handleCloseModal = () => setSelectedReserva(null);

    const columns = [
        { header: "ID", accessor: "id" },
        { header: "Cliente", accessor: "nombreCliente" },
        { header: "Punto Venta", accessor: "nombrePuntoVenta" },
        { header: "Fecha", accessor: "fechaReserva" },
        { header: "Estado", accessor: "estado" },
        { header: "Método Pago", accessor: "metodoPago" },
        { header: "Anticipo", accessor: "anticipo" },
        { header: "Saldo Pendiente", accessor: "saldoPendiente" },
        {
            header: "Detalles",
            accessor: "actions",
            render: (row) => (
                <button className="detalles-button" onClick={() => handleShowReserva(row)}>
                    Ver Detalles
                </button>
            ),
        },
    ];

    return (
        <div className="reservas-container">
            <Toaster richColors position="bottom-right" />

            <h2>Historial Detallado de Reservas</h2>

            {/* Filtros */}
            <div className="filters">
                <SelectSecondary
                    formikCompatible={false}
                    name="estado" value={filters.estado} onChange={handleFilterChange}>
                    <option value="">Todos</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Aprobada">Aprobada</option>
                    <option value="Rechazada">Rechazada</option>
                    <option value="Cancelada">Cancelada</option>
                    <option value="Completada">Completada</option>
                </SelectSecondary>

                <CustomDatePicker
                    placeholderText="Desde"
                    selected={filters.desde ? new Date(filters.desde) : null}
                    onChange={(date) =>
                        setFilters((prev) => ({ ...prev, desde: date ? date.toISOString() : "" }))
                    }
                />

                <CustomDatePicker
                    placeholderText="Hasta"
                    selected={filters.hasta ? new Date(filters.hasta) : null}
                    onChange={(date) =>
                        setFilters((prev) => ({ ...prev, hasta: date ? date.toISOString() : "" }))
                    }
                />


                <Button onClick={handleApplyFilters}>Filtrar</Button>
            </div>

            {isLoading ? (
                <p>Cargando reservas...</p>
            ) : (
                <Table columns={columns} data={data || []} />
            )}

            {/* Modal de Detalles */}
            {selectedReserva && (
                <Modal isOpen={!!selectedReserva} onClose={handleCloseModal}>
                    <h2>Detalles de la Reserva #{selectedReserva.id}</h2>
                    <p><strong>Cliente:</strong> {selectedReserva.nombreCliente}</p>
                    <p><strong>Punto Venta:</strong> {selectedReserva.nombrePuntoVenta}</p>
                    <p><strong>Estado:</strong> {selectedReserva.estado}</p>
                    <p><strong>Observaciones:</strong> {selectedReserva.observaciones}</p>

                    <h3>Productos:</h3>
                    <ul className="productos-list">
                        {selectedReserva.items.map((item) => (
                            <li key={item.idItem} className="producto-item">
                                <div className="producto-info-reserva">
                                    <img
                                        src={
                                            item.photoUrl ||
                                            "https://res.cloudinary.com/dzizafv5s/image/upload/v1739134946/swwqwwjh2kxmd4dugnql.jpg"
                                        }
                                        alt={item.descripcion}
                                        style={{ width: "80px", height: "80px" }}
                                    />
                                    <div>
                                        <p>{item.descripcion}</p>
                                        <p>Cantidad: {item.cantidad}</p>
                                        <p>Precio: Bs {item.precioUnitario.toFixed(2)}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Modal>
            )}
        </div>
    );
};

export default ReservasDetalleTable;
