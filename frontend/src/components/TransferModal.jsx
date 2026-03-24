import React, { useState, useEffect } from 'react';

const TransferModal = ({ onClose, onTransfer, branches = [], products = [] }) => {
  const [fromBranch, setFromBranch] = useState(branches.length > 0 ? branches[0].name : '');
  const [toBranch, setToBranch] = useState(branches.length > 1 ? branches[1].name : '');
  const [selectedSku, setSelectedSku] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [error, setError] = useState('');

  // Extract base branch name (e.g., "Mumbai" from "Mumbai — Bandra")
  const getBaseBranchName = (fullName) => fullName.split(' — ')[0];

  // Filter products by fromBranch and only those with stock
  const availableProducts = products.filter(p => 
    fromBranch.startsWith(p.branch) && p.onHand > 0
  );
  
  // Filter branches for "To Branch" to exclude "From Branch"
  const destinationBranches = branches.filter(b => b.name !== fromBranch);

  useEffect(() => {
    if (availableProducts.length > 0) {
      setSelectedSku(availableProducts[0].sku);
    } else {
      setSelectedSku('');
    }
  }, [fromBranch, availableProducts.length]); // Re-sync if fromBranch OR available products count changes

  // Ensure toBranch is updated if it becomes invalid after fromBranch changes
  useEffect(() => {
    if (fromBranch === toBranch && destinationBranches.length > 0) {
      setToBranch(destinationBranches[0].name);
    }
  }, [fromBranch, toBranch, destinationBranches.length]);

  const selectedProduct = availableProducts.find(p => p.sku === selectedSku);

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericQuantity = parseFloat(quantity);
    
    if (!fromBranch || !toBranch || !selectedSku || isNaN(numericQuantity) || numericQuantity <= 0) {
      setError('Please fill all fields with valid quantity');
      return;
    }
    if (getBaseBranchName(fromBranch) === getBaseBranchName(toBranch)) {
      setError('Source and destination branches must be different');
      return;
    }
    if (selectedProduct && numericQuantity > selectedProduct.onHand) {
      setError(`Insufficient stock. Max available: ${selectedProduct.onHand} ${selectedProduct.unit}`);
      return;
    }

    onTransfer({
      from_branch: getBaseBranchName(fromBranch),
      to_branch: getBaseBranchName(toBranch),
      product_sku: selectedSku,
      quantity: numericQuantity
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>New Internal Transfer</h2>
        {error && <div style={{ color: 'var(--red)', marginBottom: '12px', fontSize: '12px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>From Branch</label>
            <select value={fromBranch} onChange={(e) => setFromBranch(e.target.value)}>
              {branches.map(b => <option key={`from-${b.name}`} value={b.name}>{b.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>To Branch</label>
            <select value={toBranch} onChange={(e) => setToBranch(e.target.value)}>
              {destinationBranches.map(b => <option key={`to-${b.name}`} value={b.name}>{b.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Select Ingredient</label>
            <select value={selectedSku} onChange={(e) => setSelectedSku(e.target.value)} disabled={availableProducts.length === 0}>
              {availableProducts.length === 0 ? (
                <option value="">No stock available in this branch</option>
              ) : (
                availableProducts.map(p => (
                  <option key={p.sku} value={p.sku}>
                    {p.name} ({p.onHand} {p.unit} available)
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Quantity to Transfer {selectedProduct && `(${selectedProduct.unit})`}</label>
            <input 
              type="number" 
              value={quantity} 
              onChange={(e) => setQuantity(e.target.value)} 
              min="0.1" 
              step="0.1"
              required 
            />
          </div>

          <div className="form-actions">
            <button type="button" className="tb-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="tb-btn primary" disabled={availableProducts.length === 0}>
              Confirm Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;
