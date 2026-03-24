import React from 'react';

const SubBar = ({ activePage, onPageChange, onToast }) => {
  const menuItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'products', label: 'Products' },
    { id: 'operations', label: 'Operations' },
    { id: 'replenishment', label: 'Replenishment' },
    { id: 'branches', label: 'Branches' },
    { id: 'auto-reorder', label: '🚚 Auto-Reorder' },
    { id: 'aiassist', label: '🧠 AI Assistant' },
  ];

  return (
    <div className="subbar">
      {menuItems.map((item) => (
        <div
          key={item.id}
          className={`sb-item ${activePage === item.id ? 'on' : ''}`}
          onClick={() => onPageChange(item.id)}
        >
          {item.label}
        </div>
      ))}
      <div className="sb-right">
        <div className="tb-btn" onClick={() => onToast('Settings', 'Configure warehouses, routes & reorder rules')}>
          ⚙️ Settings
        </div>
      </div>
    </div>
  );
};

export default SubBar;
