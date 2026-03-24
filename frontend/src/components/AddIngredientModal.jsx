import React, { useState } from 'react';

const AddIngredientModal = ({ onClose, onAdd, branches = [] }) => {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Coffee Beans');
  const [branch, setBranch] = useState(branches && branches.length > 0 ? branches[0].name : '');
  const [onHand, setOnHand] = useState('');
  const [unit, setUnit] = useState('kg');
  const [price, setPrice] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProduct = {
      sku,
      name,
      category,
      branch,
      on_hand: parseFloat(onHand),
      unit,
      price: `₹${price}`,
      category_color: 'green',
      forecast: 0,
      rule: 'Manual',
      status: 'OK',
      status_color: 'green',
      progress: 50,
    };
    onAdd(newProduct);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add New Ingredient</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>SKU</label>
            <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>Coffee Beans</option>
              <option>Milk & Dairy</option>
              <option>Syrups</option>
              <option>Toppings</option>
            </select>
          </div>
          <div className="form-group">
            <label>Branch</label>
            <select value={branch} onChange={(e) => setBranch(e.target.value)}>
              {branches.map(b => <option key={b.name}>{b.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>On Hand</label>
            <input type="number" value={onHand} onChange={(e) => setOnHand(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Unit</label>
            <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Price</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <div className="form-actions">
            <button type="button" className="tb-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="tb-btn primary">Add Ingredient</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddIngredientModal;
