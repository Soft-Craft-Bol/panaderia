import React from 'react';
import GenericForm from '../../components/forms/genericForm/GenericForm';
import { createInsumo } from '../../service/api';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

const CrearInsumoPage = () => {
  const navigate = useNavigate();

  const validationSchema = Yup.object().shape({
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
    { name: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Ingrese el nombre del insumo' },
    { name: 'proveedor', label: 'Proveedor', type: 'text', placeholder: 'Ingrese el proveedor' },
    { name: 'marca', label: 'Marca', type: 'text', placeholder: 'Ingrese la marca' },
    { name: 'precio', label: 'Precio', type: 'number', placeholder: 'Ingrese el precio' },
    { name: 'unidades', label: 'Unidades', type: 'text', placeholder: 'Ingrese las unidades' },
    { name: 'descripcion', label: 'Descripción', type: 'text', placeholder: 'Ingrese la descripción' },

  ];

  const handleSubmit = async (values) => {
    try {
      await createInsumo(values);
      localStorage.removeItem('insumos');
      navigate('/insumos');
    } catch (error) {
      console.error('Error creando el insumo:', error);
    }
  };

  return (
    <GenericForm
      initialValues={{
        nombre: '',
        proveedor: '',
        marca: '',
        precio: '',
        unidades: '',
        descripcion: '',
        imagen: '',
        activo: true,
      }}

      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      fields={fields}
      title="Crear Insumo"
      onClose={() => navigate('/insumos')}
      showImageUpload={true}
    />
  );
};

export default CrearInsumoPage;