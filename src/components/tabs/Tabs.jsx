import React from 'react';
import PropTypes from 'prop-types';
import './Tabs.css';

export const Tabs = ({ children, activeTab, onChange }) => {
  return (
    <div className="tabs-container">
      <div className="tabs-header" role="tablist">
        {React.Children.map(children, (child) => {
          const Icon = child.props.icon;
          return (
            <button
              role="tab"
              aria-selected={activeTab === child.props.value}
              aria-controls={`tabpanel-${child.props.value}`}
              id={`tab-${child.props.value}`}
              className={`tab-button ${activeTab === child.props.value ? 'active' : ''}`}
              onClick={() => onChange(child.props.value)}
            >
              {Icon && <Icon className="tab-icon" aria-hidden="true" />}
              <span className="tab-label">{child.props.label}</span>
              {activeTab === child.props.value && <div className="tab-indicator" />}
            </button>
          );
        })}
      </div>
      <div className="tabs-content">
        {React.Children.map(children, (child) => (
          <div 
            role="tabpanel"
            id={`tabpanel-${child.props.value}`}
            aria-labelledby={`tab-${child.props.value}`}
            hidden={activeTab !== child.props.value}
          >
            {activeTab === child.props.value && child.props.children}
          </div>
        ))}
      </div>
    </div>
  );
};

Tabs.propTypes = {
  children: PropTypes.node.isRequired,
  activeTab: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export const Tab = ({ children, label, value, icon }) => {
  return <>{children}</>;
};

Tab.propTypes = {
  children: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  icon: PropTypes.elementType, 
};