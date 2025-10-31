import React, { useEffect, useState } from 'react';
import './Table.css';
import ColumnVisibilityControl from './ColumnVisibilityControl';

export function useColumnVisibility(columns, storageKey = 'tableHiddenColumns') {
  const [hiddenColumns, setHiddenColumns] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(hiddenColumns));
  }, [hiddenColumns, storageKey]);

  const toggleColumnVisibility = (columnAccessor) => {
    setHiddenColumns(prev =>
      prev.includes(columnAccessor)
        ? prev.filter(col => col !== columnAccessor)
        : [...prev, columnAccessor]
    );
  };

  const filteredColumns = columns.filter(column =>
    !hiddenColumns.includes(column.accessor) && (column.show !== false)
  ).map(column => {
    if (!column.columns) return column;
    return {
      ...column,
      columns: column.columns.filter(subCol =>
        !hiddenColumns.includes(subCol.accessor) && (subCol.show !== false))
    };
  });

  return {
    hiddenColumns,
    toggleColumnVisibility,
    filteredColumns,
    ColumnVisibilityControl: ({ buttonLabel, buttonIcon }) => (
      <ColumnVisibilityControl
        columns={columns}
        hiddenColumns={hiddenColumns}
        onToggleColumn={toggleColumnVisibility}
        buttonLabel={buttonLabel}
        buttonIcon={buttonIcon}
      />
    )
  };
}

const Table = ({
  columns,
  data,
  onRowClick,
  pagination,
  onPageChange,
  onRowsPerPageChange,
  showColumnVisibility = false,
  loading = false,
  storageKey = 'tableHiddenColumns'
}) => {
  const {
    currentPage,
    totalPages,
    totalElements,
    rowsPerPage
  } = pagination || {};


  const hasSubColumns = columns.some(column => column.columns);

  const {
    filteredColumns,
    ColumnVisibilityControl: TableColumnVisibilityControl,
    hiddenColumns,
  } = useColumnVisibility(columns, storageKey);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(hiddenColumns));
  }, [hiddenColumns, storageKey]);



  return (
    <div className="table-wrapper">
      <div className="table-container">
        <table className="reusable-table">
          <thead>
            {filteredColumns.length > 0 && (
              <>
                <tr>
                  {filteredColumns.map((column, index) => (
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
                    {filteredColumns.map((column, index) =>
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
              </>
            )}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={filteredColumns.length} className="loading-cell">
                  <div className="loading-spinner"></div>
                  Cargando datos...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={filteredColumns.length} className="empty-cell">

                  No hay datos disponibles
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} onClick={() => onRowClick && onRowClick(row)}>
                  {filteredColumns.map((column, colIndex) => {
                    if (column.columns) {
                      return column.columns.map((subColumn, subIndex) => (
                        <td key={`${colIndex}-${subIndex}`} data-label={subColumn.header}>
                          {row[subColumn.accessor] || '-'}
                        </td>

                      ));
                    } else {
                      return (
                        <td key={colIndex} data-label={column.header}>
                          {column.render ? column.render(row) : (row[column.accessor] || '-')}
                        </td>

                      );
                    }
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.41 16.59L10.83 12L15.41 7.41L14 6L8 12L14 18L15.41 16.59Z" fill="currentColor" />
              </svg>
              Anterior
            </button>
            <span className="pagination-info">
              Página {currentPage} de {totalPages}
            </span>
            <button
              className="pagination-button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              Siguiente
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;