import React from 'react'
import './TopCard.css'
import { FaWallet } from 'react-icons/fa'

const TopCard = ({ title, quantity, porcentaje, Icon = FaWallet }) => {
  return (
    <div className="info-card">
      <div className="card-content">
        <h5 className="card-title">{title}</h5>
        <h4 className="card-value">
          {quantity}
          {porcentaje && <span className="card-percentage">{porcentaje}</span>}
        </h4>
      </div>
      <div className="card-icon-container">
        <Icon className="card-icon" />
      </div>
    </div>
  )
}

export default TopCard