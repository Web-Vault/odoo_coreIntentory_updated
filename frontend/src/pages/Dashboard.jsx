import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import TopNav from '../components/TopNav';
import SubBar from '../components/SubBar';
import SideBar from '../components/SideBar';
import StatCard from '../components/StatCard';
import OperationCard from '../components/OperationCard';
import AIAssistant from '../components/AIAssistant';
import ForecastBar from '../components/ForecastBar';
import BranchCard from '../components/BranchCard';
import GlobalNavbar from '../components/GlobalNavbar';
import AddIngredientModal from '../components/AddIngredientModal';
import TransferModal from '../components/TransferModal';

const Dashboard = () => {
  const [activePage, setActivePage] = useState('overview');
  const [toast, setToast] = useState({ show: false, title: '', sub: '', type: '' });
  const [dashboardData, setDashboardData] = useState(null);
  const [recentOps, setRecentOps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productFilter, setProductFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('All Branches');

  // Sync branch filter with active page for specific branch tabs
  useEffect(() => {
    if (activePage === 'branches') setSelectedBranchFilter('Mumbai');
    else if (activePage === 'branch-pune') setSelectedBranchFilter('Pune');
    else if (activePage === 'branch-delhi') setSelectedBranchFilter('Delhi');
    else if (activePage === 'products') {
      // Keep existing filter or default to All if it was a specific branch
      if (['Mumbai', 'Pune', 'Delhi'].includes(selectedBranchFilter)) {
        // Option: reset to All or keep it. User said "when select to any perticular branch tab... show that branch data only".
        // For "All Ingredients" tab, we want the dropdown to be visible.
      }
    } else {
      // For other global tabs (low-stock, auto-reorder), default to All Branches
      setSelectedBranchFilter('All Branches');
    }
  }, [activePage]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/dashboard');
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || `Server error: ${response.status}`);
        }
        const result = await response.json();
        setDashboardData(result);
        setRecentOps(result.recentOperations);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const showToast = (title, sub, type = 'success') => {
    setToast({ show: true, title, sub, type });
    setTimeout(() => setToast({ show: false, title: '', sub: '', type: '' }), 3500);
  };

  const addItems = async (item, quantity) => {
    const product = dashboardData.products.find(p => p.name.toLowerCase() === item.toLowerCase());
    if (!product) {
      showToast('Error', `Product "${item}" not found`, 'error');
      return;
    }

    const newQuantity = product.onHand + parseInt(quantity);
    try {
      const response = await fetch(`http://localhost:8000/api/products/${product.sku}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ on_hand: newQuantity })
      });
      if (!response.ok) throw new Error('Update failed');
      const updatedProduct = await response.json();
      
      const updatedProducts = dashboardData.products.map(p => 
        p.sku === updatedProduct.sku ? updatedProduct : p
      );
      setDashboardData({ ...dashboardData, products: updatedProducts });
      showToast('Items Added', `${quantity} of ${item} added.`);
    } catch (error) {
      console.error('Error adding items:', error);
      showToast('Error', 'Failed to update database', 'error');
    }
  };

  const removeItems = async (item, quantity) => {
    const product = dashboardData.products.find(p => p.name.toLowerCase() === item.toLowerCase());
    if (!product) {
      showToast('Error', `Product "${item}" not found`, 'error');
      return;
    }

    const newQuantity = Math.max(0, product.onHand - parseInt(quantity));
    try {
      const response = await fetch(`http://localhost:8000/api/products/${product.sku}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ on_hand: newQuantity })
      });
      if (!response.ok) throw new Error('Update failed');
      const updatedProduct = await response.json();
      
      const updatedProducts = dashboardData.products.map(p => 
        p.sku === updatedProduct.sku ? updatedProduct : p
      );
      setDashboardData({ ...dashboardData, products: updatedProducts });
      showToast('Items Removed', `${quantity} of ${item} removed.`);
    } catch (error) {
      console.error('Error removing items:', error);
      showToast('Error', 'Failed to update database', 'error');
    }
  };

  const handleAddIngredient = async (newProduct) => {
    try {
      const response = await fetch('http://localhost:8000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add ingredient');
      }
      
      const addedProduct = await response.json();
      setDashboardData({
        ...dashboardData,
        products: [...dashboardData.products, addedProduct]
      });
      setIsModalOpen(false);
      showToast('Success', `${addedProduct.name} added to inventory.`);
    } catch (error) {
      console.error('Error adding ingredient:', error);
      showToast('Error', error.message, 'error');
    }
  };

  const handleTransfer = async (transferData) => {
    try {
      const response = await fetch('http://localhost:8000/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferData)
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Transfer failed');
      }
      
      const result = await response.json();
      
      // Update local state for operations and products
      const formattedOp = {
        ...result,
        from: result.from,
        to: result.to
      };
      setRecentOps([formattedOp, ...recentOps.slice(0, 4)]);
      
      // Refresh dashboard data to update stock levels
      const dashboardResponse = await fetch('http://localhost:8000/api/dashboard');
      if (dashboardResponse.ok) {
        const updatedDashboardData = await dashboardResponse.json();
        setDashboardData(updatedDashboardData);
      }
      
      setIsTransferModalOpen(false);
      showToast('Transfer Successful', `${transferData.quantity} transferred.`);
    } catch (error) {
      console.error('Error in transfer:', error);
      showToast('Transfer Error', error.message, 'error');
    }
  };

  const handleScheduleReorder = async (sku, date) => {
    try {
      const response = await fetch(`http://localhost:8000/api/products/${sku}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reorder_date: date })
      });
      
      if (!response.ok) throw new Error('Failed to schedule');
      
      const updatedProduct = await response.json();
      const updatedProducts = dashboardData.products.map(p => 
        p.sku === updatedProduct.sku ? updatedProduct : p
      );
      setDashboardData({ ...dashboardData, products: updatedProducts });
      showToast('Scheduled', `Auto-order for ${updatedProduct.name} set for ${date}`);
    } catch (error) {
      console.error('Error scheduling reorder:', error);
      showToast('Error', 'Failed to save schedule', 'error');
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loader"></div>
      <p>Brewing your dashboard... ☕</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <h2>Oops! Something went wrong.</h2>
      <p>{error}</p>
      <button className="tb-btn primary" onClick={() => window.location.reload()}>Retry</button>
    </div>
  );

  if (!dashboardData) return null;

  // Filter products based on selected filter and search query
  const filteredProducts = dashboardData.products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (productFilter === 'low-stock') return matchesSearch && (p.statusColor === 'red' || p.status === 'Low');
    if (productFilter === 'expiring') return matchesSearch && p.status === 'Expiring';
    if (productFilter === 'branch-pune') return matchesSearch && p.branch === 'Pune';
    if (productFilter === 'branch-delhi') return matchesSearch && p.branch === 'Delhi';
    if (productFilter === 'branches') return matchesSearch && p.branch === 'Mumbai';
    if (productFilter === 'auto-reorder') return matchesSearch && (p.rule === 'Min-Max' || p.rule === 'Urgent');
    
    return matchesSearch;
  });

  return (
    <div className="shell" style={{ position: 'relative', paddingTop: '64px' }}>
      <GlobalNavbar />
      {toast.show && (
        <div id="toast" className={`toast ${toast.type}`}>
          <div className="toast-title">{toast.title}</div>
          <div className="toast-sub">{toast.sub}</div>
        </div>
      )}

      <SubBar activePage={activePage} onPageChange={setActivePage} onToast={showToast} />

      <div className="body">
        <SideBar activePage={activePage} onPageChange={setActivePage} dashboardData={dashboardData} />

        <div className="main">
          {['overview', 'products', 'operations', 'replenishment', 'branches', 'aiassist', 'low-stock', 'expiring', 'branch-pune', 'branch-delhi', 'auto-reorder'].includes(activePage) && (
            <div className="pg">
              <div className="toolbar">
                <div className="breadcrumb">
                  <span>Inventory</span><span className="bc-sep">/</span><span className="bc-active">
                    {activePage === 'overview' && 'Overview'}
                    {activePage === 'products' && 'All Ingredients'}
                    {activePage === 'low-stock' && 'Low Stock Alert'}
                    {activePage === 'expiring' && 'Expiring Soon'}
                    {activePage === 'branches' && 'Mumbai Branch'}
                    {activePage === 'branch-pune' && 'Pune Branch'}
                    {activePage === 'branch-delhi' && 'Delhi Branch'}
                    {activePage === 'operations' && 'Operations'}
                    {activePage === 'replenishment' && 'Demand Forecast'}
                    {activePage === 'aiassist' && 'Waste Prevention'}
                    {activePage === 'auto-reorder' && 'Auto-Reorder Queue'}
                  </span>
                </div>
                <div className="tb-gap"></div>
                
                {/* Search and Filters - Visible on most ingredient-related pages */}
                {['products', 'low-stock', 'expiring', 'branches', 'branch-pune', 'branch-delhi', 'auto-reorder'].includes(activePage) && (
                  <>
                    {activePage === 'products' && (
                      <select 
                        className="search-input" 
                        style={{ 
                          padding: '8px 12px', 
                          borderRadius: '8px', 
                          border: '1px solid var(--border)', 
                          marginRight: '12px',
                          fontSize: '12px',
                          background: 'var(--card)',
                          color: 'var(--text)',
                          cursor: 'pointer'
                        }}
                        value={selectedBranchFilter}
                        onChange={(e) => setSelectedBranchFilter(e.target.value)}
                      >
                        <option value="All Branches">All Branches</option>
                        {dashboardData.branches.map(b => (
                          <option key={b.name} value={b.name.split(' — ')[0]}>{b.name.split(' — ')[0]}</option>
                        ))}
                      </select>
                    )}
                    <input 
                      type="text" 
                      className="search-input" 
                      placeholder="Search..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ 
                        padding: '8px 12px', 
                        borderRadius: '8px', 
                        border: '1px solid var(--border)', 
                        marginRight: '12px',
                        fontSize: '12px',
                        background: 'var(--card)',
                        color: 'var(--text)'
                      }}
                    />
                    <div 
                      className={`filter-chip ${productFilter === 'low-stock' || activePage === 'low-stock' ? 'on' : ''}`}
                      onClick={() => {
                        if (activePage !== 'low-stock') setProductFilter(productFilter === 'low-stock' ? 'all' : 'low-stock');
                      }}
                    >
                      Low Stock {(productFilter === 'low-stock' || activePage === 'low-stock') ? '✕' : ''}
                    </div>
                  </>
                )}

                {activePage === 'overview' && (
                  <>
                    <div className="view-toggle">
                      <div className={`vt-btn ${viewMode === 'grid' ? 'on' : ''}`} onClick={() => setViewMode('grid')}>■■</div>
                      <div className={`vt-btn ${viewMode === 'list' ? 'on' : ''}`} onClick={() => setViewMode('list')}>☰</div>
                    </div>
                    <div className="tb-btn primary" onClick={() => setIsTransferModalOpen(true)}>+ New Transfer</div>
                  </>
                )}

                {['products', 'low-stock', 'expiring', 'branches', 'branch-pune', 'branch-delhi'].includes(activePage) && (
                  <div className="tb-btn primary" onClick={() => setIsModalOpen(true)}>+ New</div>
                )}
              </div>

              {/* OVERVIEW CONTENT */}
              {activePage === 'overview' && (
                <>
                  {viewMode === 'grid' ? (
                    <div className="op-grid" style={{ marginBottom: '24px' }}>
                      {dashboardData.operations.map((op, idx) => (
                        <OperationCard
                          key={op.id}
                          label={op.label}
                          value={op.value}
                          sub={op.sub}
                          badge={op.badge}
                          badgeColor={op.badgeColor}
                          delay={idx * 0.03}
                          icon={['📦', '🚚', '↔️', '✓', '♻️', '⚠️'][idx]}
                          onClick={() => showToast(op.label, op.sub)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="table-wrap" style={{ marginBottom: '24px' }}>
                      <table>
                        <thead>
                          <tr>
                            <th>Operation</th>
                            <th>Sub</th>
                            <th>Status</th>
                            <th>Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.operations.map((op, idx) => (
                            <tr key={op.id}>
                              <td className="bold">{op.label}</td>
                              <td>{op.sub}</td>
                              <td><span className={`badge b-${op.badgeColor}`}>{op.badge}</span></td>
                              <td className="bold">{op.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="stat-row">
                    {dashboardData.stats.map((stat, idx) => (
                      <StatCard
                        key={stat.id}
                        label={stat.label}
                        value={stat.value}
                        trend={stat.trend}
                        trendType={stat.trendType}
                        delay={idx * 0.05}
                      />
                    ))}
                  </div>

                  <div className="table-wrap">
                    <div className="tbl-header">
                      <div className="tbl-title">Recent Internal Operations</div>
                      <div className="tb-btn" onClick={() => showToast('Refreshed', 'Database re-synced')}>↻ Sync</div>
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>Ref</th>
                          <th>Type</th>
                          <th>From</th>
                          <th>To</th>
                          <th>Ingredient</th>
                          <th>Qty</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOps.map((op, idx) => (
                          <tr key={idx} style={{ animation: 'fadeUp .4s ease both', animationDelay: `${idx * 0.05}s` }}>
                            <td className="bold">{op.ref}</td>
                            <td><span className={`badge b-${op.typeColor}`}>{op.type}</span></td>
                            <td>{op.from}</td>
                            <td>{op.to}</td>
                            <td className="bold">{op.item}</td>
                            <td>{op.qty}</td>
                            <td><span className={`badge b-${op.statusColor}`}>{op.status}</span></td>
                            <td style={{ color: 'var(--text3)', fontSize: '11px' }}>{op.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* INGREDIENT LIST CONTENT (REUSED FOR MULTIPLE TABS) */}
              {['products', 'low-stock', 'expiring', 'branches', 'branch-pune', 'branch-delhi', 'auto-reorder'].includes(activePage) && (
                <div className="table-wrap" style={{ marginTop: '14px' }}>
                  <table>
                    <thead>
                      <tr>
                        <th><input type="checkbox" /></th>
                        <th>SKU</th>
                        <th>Ingredient</th>
                        <th>Category</th>
                        <th>Branch</th>
                        <th>On Hand</th>
                        <th>Forecasted</th>
                        <th>Reorder Rule</th>
                        {activePage === 'auto-reorder' && <th>Reorder Qty</th>}
                        <th>Unit Price</th>
                        <th>Status</th>
                        {activePage === 'auto-reorder' && <th>Schedule Order</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {activePage === 'auto-reorder' ? (
                        // Special flat view for Auto-Reorder to show every low-stock item across all branches
                        dashboardData.products
                          .filter(p => {
                            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                                  p.sku.toLowerCase().includes(searchQuery.toLowerCase());
                            const isLowStock = p.statusColor === 'red' || p.status === 'Low' || p.status === 'Critical' || p.status === 'Low Stock';
                            return matchesSearch && isLowStock;
                          })
                          .map((p, idx) => (
                            <tr key={p.sku}>
                              <td><input type="checkbox" /></td>
                              <td style={{ color: 'var(--caramel)', fontWeight: '700', fontSize: '10px', fontFamily: 'monospace' }}>{p.sku}</td>
                              <td className="bold" style={{ color: 'var(--sky-d)', cursor: 'pointer' }} onClick={() => showToast(p.name, p.sku)}>
                                <span className="blink-alert" style={{ marginRight: '6px' }}>⚠️</span>
                                {p.name}
                              </td>
                              <td><span className={`badge b-${p.categoryColor}`}>{p.category}</span></td>
                              <td>{p.branch}</td>
                              <td>
                                <div className="prog-wrap">
                                  <div className="prog-bg">
                                    <div className="prog-f" style={{ '--w': `${p.progress}%`, background: p.progress < 25 ? '#C0392B' : 'var(--matcha)' }}></div>
                                  </div>
                                  <span style={{ color: p.progress < 25 ? '#B91C1C' : 'var(--matcha-d)', fontSize: '11px', fontWeight: '700', minWidth: '40px' }}>
                                    {p.onHand} {p.unit}
                                  </span>
                                </div>
                              </td>
                              <td style={{ color: p.forecast < 0 ? '#B91C1C' : 'var(--matcha-d)' }}>{p.forecast > 0 ? '+' : ''}{p.forecast} {p.unit}</td>
                              <td><span className={`badge b-red`}>{p.rule}</span></td>
                              <td className="bold" style={{ color: 'var(--caramel)' }}>
                                {p.reorderQty > 0 ? `${p.reorderQty} ${p.unit}` : '—'}
                              </td>
                              <td>{p.price}</td>
                              <td><span className={`badge b-${p.statusColor}`}>{p.status}</span></td>
                              <td style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input 
                                  type="datetime-local" 
                                  className="form-input" 
                                  style={{ padding: '4px', fontSize: '10px', width: '130px' }}
                                  id={`schedule-${p.sku}`}
                                  defaultValue={p.reorderDate || ''}
                                />
                                <button 
                                  className="badge b-green" 
                                  style={{ border: 'none', cursor: 'pointer', padding: '4px 8px' }}
                                  onClick={() => {
                                    const val = document.getElementById(`schedule-${p.sku}`).value;
                                    if (val) handleScheduleReorder(p.sku, val);
                                    else showToast('Error', 'Please select a date/time', 'error');
                                  }}
                                >
                                  {p.reorderDate ? 'Update' : 'Set'}
                                </button>
                              </td>
                            </tr>
                          ))
                      ) : (
                        // Normalized view for All Ingredients and other tabs
                        Array.from(new Set(dashboardData.products.map(p => p.name)))
                          .map(name => {
                            const branchProducts = dashboardData.products.filter(p => p.name === name);
                            
                            // If a branch is selected, only show that branch's data for this product
                            // If "All Branches" is selected, aggregate the data
                            if (selectedBranchFilter !== 'All Branches') {
                              const branchProduct = branchProducts.find(p => p.branch === selectedBranchFilter);
                              if (!branchProduct) return null; // Ingredient doesn't exist in this branch
                              
                              // Apply filters (low-stock, expiring, etc.)
                              const matchesSearch = branchProduct.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                                    branchProduct.sku.toLowerCase().includes(searchQuery.toLowerCase());
                              
                              if (activePage === 'low-stock' || productFilter === 'low-stock') {
                                if (!matchesSearch || !(branchProduct.statusColor === 'red' || branchProduct.status === 'Low' || branchProduct.status === 'Critical' || branchProduct.status === 'Low Stock')) return null;
                              } else if (activePage === 'expiring' || productFilter === 'expiring') {
                                if (!matchesSearch || branchProduct.status !== 'Expiring') return null;
                              } else if (!matchesSearch) return null;
                              
                              return (
                                <tr key={branchProduct.sku}>
                                  <td><input type="checkbox" /></td>
                                  <td style={{ color: 'var(--caramel)', fontWeight: '700', fontSize: '10px', fontFamily: 'monospace' }}>{branchProduct.sku}</td>
                                  <td className="bold" style={{ color: 'var(--sky-d)', cursor: 'pointer' }} onClick={() => showToast(branchProduct.name, branchProduct.sku)}>
                                    {(branchProduct.statusColor === 'red' || branchProduct.status === 'Low' || branchProduct.status === 'Critical' || branchProduct.status === 'Low Stock') && <span className="blink-alert" style={{ marginRight: '6px' }}>⚠️</span>}
                                    {branchProduct.name}
                                  </td>
                                  <td><span className={`badge b-${branchProduct.categoryColor}`}>{branchProduct.category}</span></td>
                                  <td>{branchProduct.branch}</td>
                                  <td>
                                    <div className="prog-wrap">
                                      <div className="prog-bg">
                                        <div className="prog-f" style={{ '--w': `${branchProduct.progress}%`, background: branchProduct.progress < 25 ? '#C0392B' : 'var(--matcha)' }}></div>
                                      </div>
                                      <span style={{ color: branchProduct.progress < 25 ? '#B91C1C' : 'var(--matcha-d)', fontSize: '11px', fontWeight: '700', minWidth: '40px' }}>
                                        {branchProduct.onHand} {branchProduct.unit}
                                      </span>
                                    </div>
                                  </td>
                                  <td style={{ color: branchProduct.forecast < 0 ? '#B91C1C' : 'var(--matcha-d)' }}>{branchProduct.forecast > 0 ? '+' : ''}{branchProduct.forecast} {branchProduct.unit}</td>
                                  <td><span className={`badge b-${branchProduct.statusColor === 'red' ? 'red' : 'green'}`}>{branchProduct.rule}</span></td>
                                  <td>{branchProduct.price}</td>
                                  <td><span className={`badge b-${branchProduct.statusColor}`}>{branchProduct.status}</span></td>
                                </tr>
                              );
                            } else {
                              // Aggregate view (All Branches)
                              const first = branchProducts[0];
                              const totalOnHand = branchProducts.reduce((acc, p) => acc + p.onHand, 0);
                              const avgProgress = branchProducts.reduce((acc, p) => acc + p.progress, 0) / branchProducts.length;
                              
                              // A product is low stock in "All Branches" view if it's low in ANY branch
                              const isLowStock = branchProducts.some(p => p.statusColor === 'red' || p.status === 'Low' || p.status === 'Critical' || p.status === 'Low Stock');
                              const isExpiring = branchProducts.some(p => p.status === 'Expiring');
                              
                              const matchesSearch = first.name.toLowerCase().includes(searchQuery.toLowerCase());
                              
                              if (activePage === 'low-stock' || productFilter === 'low-stock') {
                                if (!matchesSearch || !isLowStock) return null;
                              } else if (activePage === 'expiring' || productFilter === 'expiring') {
                                if (!matchesSearch || !isExpiring) return null;
                              } else if (!matchesSearch) return null;

                              return (
                                <tr key={name}>
                                  <td><input type="checkbox" /></td>
                                  <td style={{ color: 'var(--caramel)', fontWeight: '700', fontSize: '10px', fontFamily: 'monospace' }}>MULT-BR</td>
                                  <td className="bold" style={{ color: 'var(--sky-d)', cursor: 'pointer' }} onClick={() => showToast(name, 'Total across all branches')}>
                                    {isLowStock && <span className="blink-alert" style={{ marginRight: '6px' }}>⚠️</span>}
                                    {name}
                                  </td>
                                  <td><span className={`badge b-${first.categoryColor}`}>{first.category}</span></td>
                                  <td style={{ fontSize: '10px', color: 'var(--text3)' }}>{branchProducts.length} Branches</td>
                                  <td>
                                    <div className="prog-wrap">
                                      <div className="prog-bg">
                                        <div className="prog-f" style={{ '--w': `${avgProgress}%`, background: avgProgress < 25 ? '#C0392B' : 'var(--matcha)' }}></div>
                                      </div>
                                      <span style={{ color: avgProgress < 25 ? '#B91C1C' : 'var(--matcha-d)', fontSize: '11px', fontWeight: '700', minWidth: '40px' }}>
                                        {totalOnHand.toFixed(1)} {first.unit}
                                      </span>
                                    </div>
                                  </td>
                                  <td>Aggregated</td>
                                  <td>Various</td>
                                  <td>{first.price}</td>
                                  <td><span className={`badge b-${isLowStock ? 'red' : 'green'}`}>{isLowStock ? 'Branch Alert' : 'Healthy'}</span></td>
                                </tr>
                              );
                            }
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* OTHER FEATURE CONTENT */}
              {activePage === 'operations' && (
                <div className="kanban-wrap">
                  {dashboardData.operations.map((op, idx) => (
                    <div key={op.id} className="kcard" style={{ animationDelay: `${idx * 0.04}s` }} onClick={() => showToast(op.label, op.sub)}>
                      <div style={{ fontSize: '26px', marginBottom: '8px' }}>{['📦', '🚚', '↔️', '📋', '✓', '♻️'][idx]}</div>
                      <div className="kcard-title">{op.label}</div>
                      <div className="kcard-sub">{op.sub}</div>
                      <div className="kcard-count">{op.value}</div>
                      <div style={{ fontSize: '10px', color: 'var(--cinnamon)', fontWeight: '600' }}>● {Math.floor(op.value/2)} urgent</div>
                    </div>
                  ))}
                </div>
              )}

              {activePage === 'replenishment' && (
                <>
                  <div style={{ padding: '14px 20px 6px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '600', marginBottom: '8px' }}>7-day demand forecast (click bars for details)</div>
                    <ForecastBar forecast={dashboardData.forecast} onToast={showToast} />
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th><input type="checkbox" defaultChecked /></th>
                          <th>Ingredient</th>
                          <th>Branch</th>
                          <th>On Hand</th>
                          <th>Min Qty</th>
                          <th>To Order</th>
                          <th>Supplier</th>
                          <th>Lead Time</th>
                          <th>Est. Cost</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.products.slice(0, 4).map((p, idx) => (
                          <tr key={idx}>
                            <td><input type="checkbox" defaultChecked /></td>
                            <td className="bold" style={{ color: p.statusColor === 'red' ? '#B91C1C' : 'var(--cinnamon)' }}>
                              {p.statusColor === 'red' ? '⚠️' : '●'} {p.name}
                            </td>
                            <td>{p.branch}</td>
                            <td style={{ color: p.statusColor === 'red' ? '#B91C1C' : 'var(--cinnamon)' }}>{p.onHand} {p.unit}</td>
                            <td>{Math.ceil(p.onHand * 2)} {p.unit}</td>
                            <td style={{ color: 'var(--sky-d)', fontWeight: '700' }}>{Math.ceil(p.onHand * 5)} {p.unit}</td>
                            <td>Supplier Co.</td>
                            <td>{idx + 1} days</td>
                            <td className="bold">₹{Math.floor(Math.random() * 10000 + 2000)}</td>
                            <td>
                              <span className={`badge b-${p.statusColor === 'red' ? 'green' : 'amber'}`} style={{ cursor: 'pointer' }} onClick={() => showToast('PO Sent!', `Order for ${p.name} sent`)}>
                                ✓ Order
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {activePage === 'aiassist' && (
                <AIAssistant 
                  addItems={addItems}
                  removeItems={removeItems}
                  dashboardData={dashboardData}
                  replies={dashboardData.aiReplies.reduce((acc, curr) => {
                    acc[curr.question] = curr.reply;
                    return acc;
                  }, {})} 
                  defaultReply="Based on current inventory data, I can analyze stock levels, predict demand and suggest reorder actions across all 3 branches." 
                />
              )}
            </div>
          )}
        </div>
      </div>
      {isModalOpen && dashboardData && (
        <AddIngredientModal 
          onClose={() => setIsModalOpen(false)} 
          onAdd={handleAddIngredient} 
          branches={dashboardData.branches || []} 
        />
      )}
      {isTransferModalOpen && dashboardData && (
        <TransferModal
          onClose={() => setIsTransferModalOpen(false)}
          onTransfer={handleTransfer}
          branches={dashboardData.branches || []}
          products={dashboardData.products || []}
        />
      )}
    </div>
  );
};

export default Dashboard;
