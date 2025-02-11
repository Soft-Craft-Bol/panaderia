import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import Table from "../../components/table/Table";
import { getAllFacturas } from "../../service/api";
import { getUser } from "../../utils/authFunctions";
import { Toaster, toast } from "sonner";
import LinkButton from "../../components/buttons/LinkButton";
import "./ListVentas.css";


const ListVentas = () => {
  const [facturas, setFacturas] = useState([]);
  const currentUser = useMemo(() => getUser(), []);

  useEffect(() => {
    const fetchFacturas = async () => {
      const response = await getAllFacturas();
      console.log(response.data);
      setFacturas(response.data);
    };
    fetchFacturas();
  }, []);

  const hasRole = (role) => currentUser?.roles.includes(role);

  const hasAnyRole = (...roles) => roles.some((role) => currentUser?.roles.includes(role));

  const columns = useMemo(
    () => [
      { header: "ID", accessor: "id" },
      { 
        header: "Codigo cliente", 
        accessor: "codigoCliente",
      },
      { header: "Cliente", accessor: "usuario" },
      { header: "Fecha de emision", accessor: "fechaEmision" },
      { header: "Estado", accessor: "estado" },
      { 
        header: "Productos", 
        accessor: "detalleList",
        render: (factura) => factura.detalleList.map(d => d.descripcion).join(", "),
      },
      { 
        header: "Total", 
        accessor: "detalleList",
        render: (factura) => factura.detalleList.reduce((sum, d) => sum + d.subTotal, 0).toFixed(2),
      },
      
      
    ].filter(Boolean),
    [currentUser]
  );

  return (
    <div className="user-management-container">
      <Toaster dir="auto" closeButton richColors visibleToasts={2} duration={2000} position="bottom-right" />
      <div className="user-management-header">
        <h2 className="user-management-title">Gestión de ventas</h2>
        {hasAnyRole("ROLE_ADMIN", "ROLE_SECRETARIA") && (
          <LinkButton to={`/facturacion`}>Vender nuevo producto</LinkButton>
        )}
      </div>

      <Table columns={columns} data={facturas} className="user-management-table" />

    </div>
  );
};

export default ListVentas;
