import React from "react";
import { useNavigate } from "react-router-dom";

const Despachos = () => {
    const navigate = useNavigate();
    return(
        <div>
            <h1>Despachos realizados</h1>
            <button className='btn-general'
            onClick={() => navigate("/despachos/create")}>
            Registrar un nuevo despacho
             </button>
        </div>
    )
}
export default Despachos;