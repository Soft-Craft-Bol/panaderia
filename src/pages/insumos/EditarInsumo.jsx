import React from 'react';
import GenericForm from '../../components/forms/genericForm/GenericForm';
import { useLocation, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { updateInsumo } from '../../service/api'; // asegúrate de tener esta función

const EditarInsumo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { insumoData } = location.state || {};

  const initialValues = {
    nombre: insumoData?.nombre || '',
    proveedor: insumoData?.proveedor || '',
    marca: insumoData?.marca || '',
    precio: insumoData?.precio || '',
    unidades: insumoData?.unidades || '',
    descripcion: insumoData?.descripcion || '',
    imagen: insumoData?.imagen || '',
    cantidad: insumoData?.cantidad || '',
    stockMinimo: insumoData?.stockMinimo || '',
    fechaIngreso: insumoData?.fechaIngreso?.slice(0, 10) || '', // formato yyyy-mm-dd
    fechaVencimiento: insumoData?.fechaVencimiento?.slice(0, 10) || '',
  };

  const validationSchema = Yup.object({
    nombre: Yup.string().required('El nombre es requerido'),
    proveedor: Yup.string().required('El proveedor es requerido'),
    marca: Yup.string().required('La marca es requerida'),
    precio: Yup.number().required('El precio es requerido').positive('Debe ser positivo'),
    unidades: Yup.string().required('Las unidades son requeridas'),
    descripcion: Yup.string().required('La descripción es requerida'),
    cantidad: Yup.number().required('La cantidad es requerida').min(0, 'Debe ser 0 o más'),
    stockMinimo: Yup.number().required('El stock mínimo es requerido').min(0, 'Debe ser 0 o más'),
    fechaIngreso: Yup.date().required('La fecha de ingreso es requerida'),
    fechaVencimiento: Yup.date()
      .min(Yup.ref('fechaIngreso'), 'Debe ser posterior a la fecha de ingreso')
      .required('La fecha de vencimiento es requerida'),
  });

  const fields = [
    { name: 'nombre', label: 'Nombre', placeholder: 'Ingrese el nombre del insumo' },
    { name: 'proveedor', label: 'Proveedor', placeholder: 'Ingrese el proveedor' },
    { name: 'marca', label: 'Marca', placeholder: 'Ingrese la marca' },
    { name: 'precio', label: 'Precio', type: 'number', placeholder: 'Ingrese el precio' },
    { name: 'unidades', label: 'Unidades', placeholder: 'Ingrese las unidades' },
    { name: 'descripcion', label: 'Descripción', placeholder: 'Ingrese la descripción' },
    { name: 'cantidad', label: 'Cantidad', type: 'number', placeholder: 'Ingrese la cantidad disponible' },
    { name: 'stockMinimo', label: 'Stock mínimo', type: 'number', placeholder: 'Ingrese el stock mínimo' },
    { name: 'fechaIngreso', label: 'Fecha de ingreso', type: 'date' },
    { name: 'fechaVencimiento', label: 'Fecha de vencimiento', type: 'date' },
  ];

  const handleSubmit = async (values) => {
    try {
      await updateInsumo(insumoData.id, values); // Asegúrate de tener el ID y endpoint configurado
      navigate('/insumos');
    } catch (error) {
      console.error('Error actualizando insumo:', error);
    }
  };

  return (
    <GenericForm
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      fields={fields}
      title="Editar Insumo"
      imageUrl={insumoData?.imagen}
      isEditing={true}
      onClose={() => navigate('/insumos')}
    />
  );
};

export default EditarInsumo;
