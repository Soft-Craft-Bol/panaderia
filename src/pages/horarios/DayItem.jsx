import { Switch } from "antd";
import React, { useState, useEffect } from "react";
import Select from "react-select";

const hours = [
  { value: "06:00", label: "06:00" },
  { value: "07:00", label: "07:00" },
  { value: "08:00", label: "08:00" },
  { value: "09:00", label: "09:00" },
  { value: "10:00", label: "10:00" },
  { value: "11:00", label: "11:00" },
  { value: "12:00", label: "12:00" },
  { value: "13:00", label: "13:00" },
  { value: "14:00", label: "14:00" },
  { value: "15:00", label: "15:00" },
  { value: "16:00", label: "16:00" },
  { value: "17:00", label: "17:00" },
  { value: "18:00", label: "18:00" },
  { value: "19:00", label: "19:00" },
  { value: "20:00", label: "20:00" },
  { value: "21:00", label: "21:00" },
];

export default function DayItem({ dayName, onSelectTime }) {
  const [icon, setIcon] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  useEffect(() => {
    function loadUserDataAvailable() {
      const storedDataIcon = localStorage.getItem(`${dayName}Icon`);
      const storedIcon = storedDataIcon ? JSON.parse(storedDataIcon) : null;

      if(!storedIcon){
        const storedDataFrom = localStorage.getItem(`${dayName}From`);
        const timeFrom = storedDataFrom ? JSON.parse(storedDataFrom) : null;
        if (timeFrom) setStartTime(timeFrom);

        const storedDataTo = localStorage.getItem(`${dayName}To`);
        const timeTo = storedDataTo ? JSON.parse(storedDataTo) : null;
        if (timeTo) setEndTime(timeTo);
      } else {
        setIcon(storedIcon);
      }
    }
    loadUserDataAvailable();
  }, [dayName]);

  useEffect(() => {
    function saveSelectTime() {
      onSelectTime({
        isSelected: !icon,
        dayName: dayName,
        startTime: startTime?.value,
        endTime: endTime?.value,
      });
    }
    if(endTime) saveSelectTime();
  }, [icon, dayName, startTime, endTime, onSelectTime]);

  useEffect(() => {
    function updateSelectTime() {
      if(icon){
        onSelectTime({
          dayName: dayName,
          startTime: null,
          endTime: null,
        });
      } else {
        onSelectTime({
          dayName: dayName,
          startTime: startTime?.value,
          endTime: endTime?.value,
        });
      }
    }
    if(endTime) updateSelectTime();
  }, [icon, endTime, startTime, dayName, onSelectTime]);

  const endTimeOptions = hours.filter((option) => {
    if (startTime) {
      return option.value > startTime.value; // Filtra solo opciones mayores a la hora de inicio seleccionada
    }
    return true; // Si no se ha seleccionado una hora de inicio, muestra todas las opciones
  });

  const toggleIcon = () => {
    setIcon(!icon);
    localStorage.setItem(`${dayName}Icon`, JSON.stringify(!icon));
  };

  const handleStartTimeChange = (selectedOption) => {
    setStartTime(selectedOption);
    localStorage.setItem(`${dayName}From`, JSON.stringify(selectedOption));
    
    // // Si la nueva hora de inicio es mayor que la hora de fin, restablecer la hora de fin
    // if (endTime && selectedOption.value >= endTime.value) {
    //   setEndTime(null);
    //   localStorage.removeItem(`${dayName}To`);
    // }

    // Si la nueva hora de inicio es mayor o igual a la hora de fin, ajustar la hora de fin
    if (!endTime || selectedOption.value >= endTime.value) {
      const nextHourIndex = hours.findIndex((hour) => hour.value === selectedOption.value) + 1;
      const nextHour = hours[nextHourIndex] || null;
      setEndTime(nextHour);
      if (nextHour) {
        localStorage.setItem(`${dayName}To`, JSON.stringify(nextHour));
      } else {
        localStorage.removeItem(`${dayName}To`);
      }
    }
  };

  const handleEndTimeChange = (selectedOption) => {
    setEndTime(selectedOption);
    localStorage.setItem(`${dayName}To`, JSON.stringify(selectedOption));
  };

  return (
    <div>
      <div className="day">
        <Switch checked={!icon} onChange={toggleIcon} />
        <p className="day-name">{dayName}</p>
        {icon ? (
          <div className="unavailable-day">
            <p>Día no disponible</p>
          </div>
        ) : (
          <div className="available-day">
            <p>De</p>
            <Select
              className="hours-selector"
              options={hours}
              placeholder="06:00"
              value={startTime}
              onChange={(selectedOption) =>
                handleStartTimeChange(selectedOption)
              }
            />
            <p>a</p>
            <Select
              className="hours-selector"
              placeholder="00:00"
              options={endTimeOptions}
              isDisabled={!startTime}
              value={endTime}
              onChange={(selectedOption) => handleEndTimeChange(selectedOption)}
            />
          </div>
        )}
      </div>
    </div>
  );
}