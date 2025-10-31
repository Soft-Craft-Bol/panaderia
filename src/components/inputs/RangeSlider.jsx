import React from 'react';
import './RangeSlider.css';

const RangeSlider = ({
  min = 0,
  max = 100,
  value,
  onChange,
  step = 1,
  className = '',
  ...props
}) => {
  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`range-slider-container ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        step={step}
        onChange={handleChange}
        className="range-slider"
        style={{
          background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${percentage}%, var(--color-border-light) ${percentage}%, var(--color-border-light) 100%)`
        }}
        {...props}
      />
      {props.showValue && (
        <div className="range-value-display">
          {value}
        </div>
      )}
    </div>
  );
};

export default RangeSlider;