import React from 'react';
import './Chard.css';

const Chard = ({ data }) => {
  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Sr. No</th>
            <th>Product Name</th>
            <th>Grade</th>
            <th>Quantity</th>
            <th>Price Per Kg</th>
            <th>Delivery Location</th>
            <th>Delivery Timeline</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.grade}</td>
              <td>{item.quantity}</td>
              <td>{item.price}</td>
              <td>{item.location}</td>
              <td>{item.timeline}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Chard;