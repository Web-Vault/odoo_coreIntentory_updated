import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import data from '../data/dashboardData.json';
import TopNav from '../components/TopNav';
import SubBar from '../components/SubBar';
import SideBar from '../components/SideBar';
import StatCard from '../components/StatCard';
import OperationCard from '../components/OperationCard';
import AIAssistant from '../components/AIAssistant';
import ForecastBar from '../components/ForecastBar';
import BranchCard from '../components/BranchCard';
import GlobalNavbar from '../components/GlobalNavbar';

const Dashboard = () => {
  const [activePage, setActivePage] = useState('overview');
  const [toast, setToast] = useState({ show: false, title: '', sub: '', type: '' });
  const [recentOps, setRecentOps] = useState(data.recentOperations);

  const showToast = (title, sub, type = 'success') => {
    setToast({ show: true, title, sub, type });
    setTimeout(() => setToast({ show: false, title: '', sub: '', type: '' }), 3500);
  };

  const handleAddOp = () => {
    const newOp = {
      ref: `WH/IN/000${Math.floor(Math.random() * 100)}`,
      type: 'Receipt',
      typeColor: 'sky',
      from: 'DairyFresh',
      to: 'Pune',
      item: 'Fresh Cream',
      qty: '10 L',
      status: 'To Do',
      statusColor: 'sky',
      date: 'Just now'
    };
    setRecentOps([newOp, ...recentOps.slice(0, 4)]);
    showToast('Operation added', `${newOp.ref} — ${newOp.item}`);
  };

  return (
    <div className="shell" style={{ position: 'relative', paddingTop: '64px' }}>
      <GlobalNavbar />
      {toast.show && (
        <div id="toast" className={`toast ${toast.type}`}>
          <div className="toast-title">{toast.title}</div>
          <div className="toast-sub">{toast.sub}</div>
        </div>
      )}

      {/* Internal Dashboard TopNav is actually the SubBar in the HTML logic */}
      <SubBar activePage={activePage} onPageChange={setActivePage} onToast={showToast} />

      <div className="body">
        <SideBar activePage={activePage} onPageChange={setActivePage} />

        <div className="main">
          {activePage === 'overview' && (
            <div className="pg">
              <div className="toolbar">
                <div className="breadcrumb">
                  <span>Inventory</span><span className="bc-sep">/</span><span className="bc-active">Overview</span>
                </div>
                <div className="tb-gap"></div>
                <div className="view-toggle">
                  <div className="vt-btn on">■■</div>
                  <div className="vt-btn">☰</div>
                </div>
                <div className="tb-btn primary" onClick={handleAddOp}>+ New Transfer</div>
              </div>

              <div className="stat-row">
                {data.stats.map((stat, idx) => (
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

              <div className="op-grid">
                {data.operations.map((op, idx) => (
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

              <div className="table-wrap">
                <div className="tbl-header">
                  <div className="tbl-title">Recent Operations</div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
                    <div className="tb-btn" onClick={() => showToast('Filter', 'Showing last 7 days')}>▼ Filter</div>
                    <div className="tb-btn primary" onClick={handleAddOp}>+ New</div>
                  </div>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th><input type="checkbox" /></th>
                      <th>Reference</th>
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
                      <tr key={idx}>
                        <td><input type="checkbox" /></td>
                        <td className="bold" style={{ color: 'var(--sky-d)', cursor: 'pointer' }} onClick={() => showToast(op.ref, op.item)}>
                          {op.ref}
                        </td>
                        <td><span className={`badge b-${op.typeColor}`}>{op.type}</span></td>
                        <td>{op.from}</td>
                        <td>{op.to}</td>
                        <td className="bold">{op.item}</td>
                        <td>{op.qty}</td>
                        <td><span className={`badge b-${op.statusColor}`}>{op.status}</span></td>
                        <td>{op.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activePage === 'products' && (
            <div className="pg">
              <div className="toolbar">
                <div className="breadcrumb">
                  <span>Inventory</span><span className="bc-sep">/</span><span className="bc-active">Products</span>
                </div>
                <div className="tb-gap"></div>
                <div className="filter-chip on">Low Stock ✕</div>
                <div className="filter-chip">Expiring Soon</div>
                <div className="filter-chip">By Branch</div>
                <div className="tb-btn primary" onClick={() => showToast('New Ingredient', 'Create ingredient form opened')}>+ New</div>
              </div>
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
                      <th>Unit Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.products.map((p, idx) => (
                      <tr key={idx}>
                        <td><input type="checkbox" /></td>
                        <td style={{ color: 'var(--caramel)', fontWeight: '700', fontSize: '10px', fontFamily: 'monospace' }}>{p.sku}</td>
                        <td className="bold" style={{ color: 'var(--sky-d)', cursor: 'pointer' }} onClick={() => showToast(p.name, p.sku)}>{p.name}</td>
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
                        <td><span className={`badge b-${p.statusColor === 'red' ? 'red' : 'green'}`}>{p.rule}</span></td>
                        <td>{p.price}</td>
                        <td><span className={`badge b-${p.statusColor}`}>{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activePage === 'operations' && (
            <div className="pg">
              <div className="toolbar">
                <div className="breadcrumb">
                  <span>Inventory</span><span className="bc-sep">/</span><span className="bc-active">Operations</span>
                </div>
                <div className="tb-gap"></div>
                <div className="tb-btn primary" onClick={() => showToast('New Operation', 'Select: Receipt / Delivery / Transfer')}>+ New</div>
              </div>
              <div className="kanban-wrap">
                {data.operations.map((op, idx) => (
                  <div key={op.id} className="kcard" style={{ animationDelay: `${idx * 0.04}s` }} onClick={() => showToast(op.label, op.sub)}>
                    <div style={{ fontSize: '26px', marginBottom: '8px' }}>{['📦', '🚚', '↔️', '📋', '✓', '♻️'][idx]}</div>
                    <div className="kcard-title">{op.label}</div>
                    <div className="kcard-sub">{op.sub}</div>
                    <div className="kcard-count">{op.value}</div>
                    <div style={{ fontSize: '10px', color: 'var(--cinnamon)', fontWeight: '600' }}>● {Math.floor(op.value/2)} urgent</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePage === 'replenishment' && (
            <div className="pg">
              <div className="toolbar">
                <div className="breadcrumb">
                  <span>Inventory</span><span className="bc-sep">/</span><span className="bc-active">Replenishment</span>
                </div>
                <div className="tb-gap"></div>
                <div className="tb-btn" onClick={() => showToast('Exported', 'CSV downloaded')}>↓ Export</div>
                <div className="tb-btn green" onClick={() => showToast('All Orders Triggered!', '6 POs created by AI auto-reorder')}>♻️ Order All</div>
              </div>
              <div style={{ padding: '14px 20px 6px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '600', marginBottom: '8px' }}>7-day demand forecast (click bars for details)</div>
                <ForecastBar forecast={data.forecast} onToast={showToast} />
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
                    {data.products.slice(0, 4).map((p, idx) => (
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
            </div>
          )}

          {activePage === 'branches' && (
            <div className="pg">
              <div className="toolbar">
                <div className="breadcrumb">
                  <span>Inventory</span><span className="bc-sep">/</span><span className="bc-active">Branches</span>
                </div>
                <div className="tb-gap"></div>
                <div className="tb-btn primary" onClick={() => showToast('New Branch', 'Branch setup form opened')}>+ Add Branch</div>
              </div>
              <div className="wh-grid">
                {data.branches.map((b, idx) => (
                  <BranchCard key={idx} {...b} delay={idx * 0.04} />
                ))}
              </div>
              <div className="table-wrap">
                <div className="tbl-header"><div className="tbl-title">Branch Utilization</div></div>
                <div style={{ padding: '16px 20px' }}>
                  {data.branches.map((b, idx) => (
                    <div key={idx} className="util-w" style={idx === data.branches.length - 1 ? { margin: 0 } : {}}>
                      <div className="util-r">
                        <span className="util-nm">{b.name}</span>
                        <span className="util-pct" style={{ color: b.util > 80 ? '#B91C1C' : b.util > 60 ? 'var(--cinnamon)' : 'var(--matcha-d)' }}>
                          {b.util}%
                        </span>
                      </div>
                      <div className="util-bg">
                        <div 
                          className="util-f" 
                          style={{ 
                            '--w': `${b.util}%`, 
                            width: `${b.util}%`, 
                            background: b.util > 80 ? '#C0392B' : b.util > 60 ? 'var(--caramel)' : 'var(--matcha)' 
                          }} 
                        />
                      </div>
                      <div className="util-s">{b.utilDesc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activePage === 'aiassist' && (
            <div className="pg">
              <div className="toolbar">
                <div className="breadcrumb">
                  <span>Inventory</span><span className="bc-sep">/</span><span className="bc-active">AI Assistant</span>
                </div>
                <div className="tb-gap"></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--matcha-d)', fontWeight: '600' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--matcha)', animation: 'blink 1.8s infinite' }}></div>
                  Model v3.1 &nbsp;·&nbsp; 94.2% accuracy
                </div>
              </div>
              <AIAssistant replies={data.aiReplies} defaultReply="Based on current inventory data, I can analyze stock levels, predict demand and suggest reorder actions across all 3 branches." />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
