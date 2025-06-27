import React from 'react';
import ReusableTable from './ReusableTable';

const App = () => {
  // Datos de ejemplo
  const data = [
    { id: 1, name: 'John Doe', age: 28, email: 'john@example.com', status: 'Active', department: 'Sales' },
    { id: 2, name: 'Jane Smith', age: 34, email: 'jane@example.com', status: 'Inactive', department: 'Marketing' },
    { id: 3, name: 'Robert Johnson', age: 45, email: 'robert@example.com', status: 'Pending', department: 'IT' },
    { id: 4, name: 'Emily Davis', age: 31, email: 'emily@example.com', status: 'Active', department: 'HR' },
    { id: 5, name: 'Michael Brown', age: 29, email: 'michael@example.com', status: 'Active', department: 'Sales' },
    { id: 6, name: 'Sarah Wilson', age: 38, email: 'sarah@example.com', status: 'Inactive', department: 'Marketing' },
    { id: 7, name: 'David Taylor', age: 42, email: 'david@example.com', status: 'Pending', department: 'IT' },
    { id: 8, name: 'Jessica Martinez', age: 27, email: 'jessica@example.com', status: 'Active', department: 'HR' },
        { id: 9, name: 'Robert Johnson', age: 45, email: 'robert@example.com', status: 'Pending', department: 'IT' },
    { id: 10, name: 'Emily Davis', age: 31, email: 'emily@example.com', status: 'Active', department: 'HR' },
    { id: 11, name: 'Michael Brown', age: 29, email: 'michael@example.com', status: 'Active', department: 'Sales' },
    { id: 12, name: 'Sarah Wilson', age: 38, email: 'sarah@example.com', status: 'Inactive', department: 'Marketing' },
    { id: 13, name: 'David Taylor', age: 42, email: 'david@example.com', status: 'Pending', department: 'IT' },
    { id: 14, name: 'Jessica Martinez', age: 27, email: 'jessica@example.com', status: 'Active', department: 'HR' },
  ];

  // Configuración de columnas
  const columns = [
    {
      Header: 'ID',
      accessor: 'id',
      sortable: true,
      filterable: false,
    },
    {
      Header: 'Nombre',
      accessor: 'name',
      sortable: true,
      filterable: true,
      filterType: 'text',
    },
    {
      Header: 'Edad',
      accessor: 'age',
      sortable: true,
      filterable: false,
    },
    {
      Header: 'Email',
      accessor: 'email',
      sortable: false,
      filterable: true,
      filterType: 'text',
    },
    {
      Header: 'Estado',
      accessor: 'status',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'active', label: 'Activo' },
        { value: 'inactive', label: 'Inactivo' },
        { value: 'pending', label: 'Pendiente' },
      ],
      Cell: ({ value }) => {
        let color;
        if (value === 'Active') color = '#28a745';
        else if (value === 'Inactive') color = '#dc3545';
        else color = '#ffc107';
        
        return (
          <span style={{ color, fontWeight: 'bold' }}>
            {value}
          </span>
        );
      },
    },
    {
      Header: 'Departamento',
      accessor: 'department',
      sortable: true,
      filterable: true,
      filterType: 'select',
    },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1.5rem', color: '#333' }}>Tabla de Empleados</h1>
      <ReusableTable 
        columns={columns} 
        data={data} 
        defaultPageSize={10}
        defaultSortColumn="name"
        defaultSortDirection="asc"
        
      />
    </div>
  );
};

export default App;