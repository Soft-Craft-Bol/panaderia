import React from 'react';
import GenericForm from '../../components/forms/GenericForm';
import { useLocation } from 'react-router-dom';
import * as Yup from 'yup';
import { editIns } from '../../service/api'; 

const EditarInsumo = () => {
  const location = useLocation();
  const { insumoData } = location.state || {};

  const initialValues = {
    nombre: insumoData?.nombre || '',
    proveedor: insumoData?.proveedor || '',
    marca: insumoData?.marca || '',
    precio: insumoData?.precio || '',
    unidades: insumoData?.unidades || '',
    descripcion: insumoData?.descripcion || '',
    imagen: insumoData?.imagen || '',
  };

  const validationSchema = Yup.object({
    nombre: Yup.string().required('El nombre es requerido'),
    proveedor: Yup.string().required('El proveedor es requerido'),
    marca: Yup.string().required('La marca es requerida'),
    precio: Yup.number()
      .required('El precio es requerido')
      .positive('El precio debe ser positivo'),
    unidades: Yup.string().required('Las unidades son requeridas'),
    descripcion: Yup.string().required('La descripción es requerida'),
  });

  const fields = [
    { name: 'nombre', label: 'Nombre', placeholder: 'Ingrese el nombre del insumo' },
    { name: 'proveedor', label: 'Proveedor', placeholder: 'Ingrese el proveedor' },
    { name: 'marca', label: 'Marca', placeholder: 'Ingrese la marca' },
    { name: 'precio', label: 'Precio', type: 'number', placeholder: 'Ingrese el precio' },
    { name: 'unidades', label: 'Unidades', placeholder: 'Ingrese las unidades' },
    { name: 'descripcion', label: 'Descripción', placeholder: 'Ingrese la descripción' },
  ];

  const handleSubmit = async (values) => {
    try {
      await editIns(insumoData.id, values); // Usa el método editIns para actualizar el insumo
      window.history.back(); // Regresa a la página anterior después de la edición
    } catch (error) {
      console.error('Error actualizando el insumo:', error);
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
      onClose={() => window.history.back()}
    />
  );
};

export default EditarInsumo;