import React from 'react';
import './Table.css';

const Table = ({ 
  columns, 
  data, 
  onRowClick, 
  pagination, 
  onPageChange,
  onRowsPerPageChange,
  loading = false
}) => {
  const { 
    currentPage, 
    totalPages, 
    totalElements,
    rowsPerPage 
  } = pagination || {};

  const hasSubColumns = columns.some(column => column.columns);

  return (
    <div className="table-container">
      <table className="reusable-table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                colSpan={column.columns ? column.columns.length : 1}
              >
                {column.header}
              </th>
            ))}
          </tr>
          {hasSubColumns && (
            <tr>
              {columns.map((column, index) =>
                column.columns ? (
                  column.columns.map((subColumn, subIndex) => (
                    <th key={`${index}-${subIndex}`}>{subColumn.header}</th>
                  ))
                ) : (
                  <th key={index}></th>
                )
              )}
            </tr>
          )}
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="loading-cell">
                Cargando datos...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="empty-cell">
                No hay datos disponibles
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} onClick={() => onRowClick && onRowClick(row)}>
                {columns.map((column, colIndex) => {
                  if (column.columns) {
                    return column.columns.map((subColumn, subIndex) => (
                      <td key={`${colIndex}-${subIndex}`}>
                        {row[subColumn.accessor] || '-'}
                      </td>
                    ));
                  } else {
                    return (
                      <td key={colIndex}>
                        {column.render ? column.render(row) : row[column.accessor] || '-'}
                      </td>
                    );
                  }
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Paginación - solo mostrar si hay datos */}
      {pagination && totalElements > 0 && (
        <div className="pagination-container">
          <div className="rows-per-page">
            <label htmlFor="rows-per-page">Filas por página:</label>
            <select
              id="rows-per-page"
              value={rowsPerPage}
              onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
              disabled={loading}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="total-elements">Total: {totalElements}</span>
          </div>

          <div className="pagination">
            <button
              className="pagination-button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              &laquo; Anterior
            </button>
            <span className="pagination-info">
              Página {currentPage} de {totalPages}
            </span>
            <button
              className="pagination-button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              Siguiente &raquo;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;