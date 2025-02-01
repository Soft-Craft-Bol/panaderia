import { useNavigate } from 'react-router-dom';

const SidebarItem = ({ title, icon: Icon, route, selected, onSelect }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        onSelect(title);
        navigate(route);
    };

    return (
        <div 
            className={`sidebar-item ${selected === title ? 'active' : ''}`} 
            onClick={handleClick}
        >
            <Icon className="icon" />
            <h4 className={selected === title ? 'active-text' : ''}>{title}</h4>
        </div>
    );
};

export default SidebarItem;