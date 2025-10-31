import { SlRefresh } from "react-icons/sl";
import "./RefetchButton.css";

export default function RefetchButton({ onRefetch, icon = <SlRefresh /> }) {
  const handleClick = () => {
    if (onRefetch) onRefetch();
  };

  return (
    <button className="refetch-btn" onClick={handleClick} aria-label="Refrescar">
      {icon}
    </button>
  );
}
