import React from 'react';
import './Card.css';
import { FaPencilAlt } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import harina from '../../../assets/img/harina.jpeg';


const Card = ({ img, titulo, datos = {}, cantidad }) => {
    return (
      <div className="card-cd">
        <div className='left'>
            <img src={harina} alt={titulo} className="card-image" />
        </div>
        <div className="info">
          <h3 className="card-title">{titulo}</h3>
          {Object.entries(datos).map(([key, value]) => (
            <p key={key} className="card-dato">
                <span className='title'>{key}:</span> {value}
            </p>
        ))}
            <div className='icons-cont'>
             <FaSearch className='icon' />
                <FaPencilAlt className='icon' />
             <FaPlus className='icon' />
            </div>
        </div>
        <div className='right-info'>
            {/* <p className="card-cantidad">{cantidad}</p> */}
            <p className="card-cantidad">30</p>
            <span className='p-label'>Ud.</span>
        </div>
      </div>
    );
  };
  
  export default Card;