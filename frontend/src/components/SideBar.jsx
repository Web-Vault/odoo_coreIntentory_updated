import React from 'react';

const SideBar = ({ activePage, onPageChange, dashboardData }) => {
  // Calculate dynamic counts from dashboardData
  const counts = {
    receipts: dashboardData?.operations?.find(op => op.label === 'Receipts')?.value || 0,
    deliveries: dashboardData?.operations?.find(op => op.label === 'Deliveries')?.value || 0,
    transfers: dashboardData?.operations?.find(op => op.label === 'Internal Transfers')?.value || 0,
    lowStock: dashboardData?.products?.filter(p => p.statusColor === 'red' || p.status === 'Low' || p.status === 'Critical').length || 0,
    expiringSoon: dashboardData?.products?.filter(p => p.status === 'Expiring').length || 0,
    mumbai: dashboardData?.products?.filter(p => p.branch === 'Mumbai').length || 0,
    pune: dashboardData?.products?.filter(p => p.branch === 'Pune').length || 0,
    delhi: dashboardData?.products?.filter(p => p.branch === 'Delhi').length || 0,
    autoReorder: dashboardData?.products?.filter(p => p.statusColor === 'red' || p.status === 'Low' || p.status === 'Critical' || p.status === 'Low Stock').length || 0,
  };

  const sections = [
    {
      label: 'Operations',
      items: [
        { id: 'overview', icon: '📦', label: 'Receipts', badge: counts.receipts, badgeColor: 'amber' },
        { id: 'operations', icon: '🚚', label: 'Deliveries', badge: counts.deliveries, badgeColor: 'amber' },
        { id: 'transfers', icon: '↔️', label: 'Transfers', badge: counts.transfers, badgeColor: 'amber' },
        { id: 'adjustments', icon: '⚙️', label: 'Adjustments' },
      ],
    },
    {
      label: 'Ingredients',
      items: [
        { id: 'products', icon: '☕', label: 'All Ingredients' },
        { id: 'low-stock', icon: '⚠️', label: 'Low Stock', badge: counts.lowStock, badgeColor: counts.lowStock > 0 ? 'red' : 'amber' },
        { id: 'expiring', icon: '📅', label: 'Expiring Soon', badge: counts.expiringSoon, badgeColor: counts.expiringSoon > 0 ? 'red' : 'amber' },
      ],
    },
    {
      label: 'Branches',
      items: [
        { id: 'branches', icon: '☕', label: 'Mumbai — Bandra', badge: counts.mumbai, badgeColor: 'amber' },
        { id: 'branch-pune', icon: '☕', label: 'Pune — Koregaon', badge: counts.pune, badgeColor: 'amber' },
        { id: 'branch-delhi', icon: '☕', label: 'Delhi — Connaught', badge: counts.delhi, badgeColor: 'amber' },
      ],
    },
    {
      label: 'AI Features',
      items: [
        { id: 'replenishment', icon: '📈', label: 'Demand Forecast' },
        { id: 'aiassist', icon: '🧠', label: 'Waste Prevention' },
        { id: 'auto-reorder', icon: '🚚', label: 'Auto-Reorder', badge: counts.autoReorder, badgeColor: 'amber' },
      ],
    },
  ];

  return (
    <div className="sidebar">
      {sections.map((section, idx) => (
        <div key={idx} className="sg-section" style={idx > 0 ? { borderTop: '1px solid var(--border)' } : {}}>
          <div className="sg-label">{section.label}</div>
          {section.items.map((item) => (
            <div
              key={item.id}
              className={`sg-item ${activePage === item.id ? 'on' : ''}`}
              onClick={() => onPageChange(item.id)}
            >
              <span>{item.icon} {item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`sg-badge sg-${item.badgeColor}`}>{item.badge}</span>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default SideBar;
