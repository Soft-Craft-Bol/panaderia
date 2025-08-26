import { FaEdit, FaEye, FaTrash } from 'react-icons/fa';
import PropTypes from 'prop-types';
import './ActionButton.css';

const ActionButtons = ({ 
  onView, 
  onEdit, 
  onDelete,
  showView = true,
  showEdit = true,
  showDelete = true,
  viewTitle = "Ver detalles",
  editTitle = "Editar",
  deleteTitle = "Eliminar"
}) => {
  return (
    <div className="action-buttons">
      {showView && (
        <button 
          className="btn-icon1 btn-view1" 
          onClick={(e) => {
            e.stopPropagation();
            onView?.();
          }} 
          title={viewTitle}
        >
          <FaEye />
        </button>
      )}
      
      {showEdit && (
        <button 
          className="btn-icon1 btn-edit1" 
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.();
          }} 
          title={editTitle}
        >
          <FaEdit />
        </button>
      )}
      
      {showDelete && (
        <button 
          className="btn-icon1 btn-delete1" 
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }} 
          title={deleteTitle}
        >
          <FaTrash />
        </button>
      )}
    </div>
  );
};

ActionButtons.propTypes = {
  onView: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  showView: PropTypes.bool,
  showEdit: PropTypes.bool,
  showDelete: PropTypes.bool,
  viewTitle: PropTypes.string,
  editTitle: PropTypes.string,
  deleteTitle: PropTypes.string,
};

export default ActionButtons;