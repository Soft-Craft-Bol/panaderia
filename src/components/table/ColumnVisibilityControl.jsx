import React, { useState } from 'react';
import './ColumnVisibilityControl.css'; // Moveremos los estilos relevantes aquí

const ColumnVisibilityControl = ({
  columns,
  hiddenColumns,
  onToggleColumn,
  buttonLabel = "Columnas",
  buttonIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 18H14V16H10V18ZM3 6V8H21V6H3ZM6 13H18V11H6V13Z" fill="currentColor" />
    </svg>
  )
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {isMenuOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      <div className="column-visibility-control">
        <button
          className="column-toggle-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {buttonIcon}
          {buttonLabel}{" "}
          <span className={`dropdown-arrow ${isMenuOpen ? "open" : ""}`}>
            ▼
          </span>
        </button>
        <div className={`column-visibility-menu ${isMenuOpen ? "open" : ""}`}>
          {columns.map((column) => (
            column.show !== false && (
              <div key={column.accessor} className="column-visibility-item">
                <label>
                <label className="switch">
                    <input
                      type="checkbox"
                      checked={!hiddenColumns.includes(column.accessor)}
                      onChange={() => onToggleColumn(column.accessor)}
                    />
                    <span className="slider"></span>
                  </label>
                  <span className="column-label">{column.header}</span>
                  
                </label>
              </div>
            )
          ))}
        </div>
      </div>
    </>
  );
};

export default ColumnVisibilityControl;