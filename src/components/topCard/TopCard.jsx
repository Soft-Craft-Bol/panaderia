import React from 'react'
import './TopCard.css'
import { FaWallet } from 'react-icons/fa'

const TopCard = ({title,quantity,porcentaje, Icon}) => {
    return (
      <div className="info-chard">
          <div>
              <h5>{title}</h5>
              <h4>{quantity}<span>{porcentaje}</span></h4>
          </div>
          <Icon className="icon-wallet" />
      </div>
    )
  }
  
  export default TopCard
