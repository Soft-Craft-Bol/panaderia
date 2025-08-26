import React from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import "./BackButton.css";

const BackButton = ({
  label = "Volver",
  to = -1,
  className = "",
  position = "lefth",
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(to);
  };

  return (
    <div className={`back-button-container ${position}`}>
      <button
        type="button"
        onClick={handleClick}
        className={`btn-back ${className}`}
      >
        <IoArrowBack size={20} style={{ marginRight: "8px" }} />
        {label}
      </button>
    </div>
  );
};

export default BackButton;
