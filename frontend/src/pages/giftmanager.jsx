import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import './giftmanager.css';

const GiftManager = () => {
  const { userRole } = useAuth(); // Use your existing auth context
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    Name: '',
    Item_Description: '',
    Category: '',
    Price: '',
    Stock_Level: '',
    Reorder_Level: '',
    Image_URL: '',
    Is_Active: true
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://coogzoobackend.vercel.app/giftshop-items-all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await response.json();
      const formattedData = data.map(item => ({
        ...item,
        Price: parseFloat(item.Price)
      }));
      
      setItems(formattedData);
    } catch (err) {
      setError(err.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchItems();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) :
              type === 'checkbox' ? e.target.checked :
              value
    }));
  };

  const checkGiftShopItemTable = async () => {
    try {
      await connection.promise().query(`
        CREATE TABLE IF NOT EXISTS Gift_Shop_Item (
          Item_ID INT PRIMARY KEY AUTO_INCREMENT,
          Name VARCHAR(255) NOT NULL,
          Item_Description TEXT,
          Category VARCHAR(100) NOT NULL,
          Price DECIMAL(10,2) NOT NULL,
          Stock_Level INT NOT NULL,
          Reorder_Level INT NOT NULL,
          Image_URL TEXT,
          Is_Active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Gift_Shop_Item table verified');
    } catch (error) {
      console.error('Error checking/creating Gift_Shop_Item table:', error);
      throw error;
    }
  };
  
  // Call this when your server starts up
  checkGiftShopItemTable();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    try {
      const submissionData = {
        Name: formData.Name,
        Item_Description: formData.Item_Description,
        Category: formData.Category,
        Price: parseFloat(formData.Price),
        Stock_Level: parseInt(formData.Stock_Level),
        Reorder_Level: parseInt(formData.Reorder_Level),
        Image_URL: formData.Image_URL || '',
        Is_Active: true
      };
  
      console.log('Submitting data:', submissionData); // Debug log
  
      const response = await fetch('https://coogzoobackend.vercel.app/giftshop-items', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to save item');
      }
  
      await fetchItems(); // Refresh the list
      resetForm();
      setError(null);
    } catch (err) {
      console.error('Error details:', err);
      setError(err.message || 'Failed to save item');
    }
  };
  const validateForm = (data) => {
    if (!data.Name || data.Name.trim() === '') {
      return 'Name is required';
    }
    if (!data.Category || data.Category.trim() === '') {
      return 'Category is required';
    }
    if (isNaN(parseFloat(data.Price)) || parseFloat(data.Price) < 0) {
      return 'Please enter a valid price';
    }
    if (isNaN(parseInt(data.Stock_Level)) || parseInt(data.Stock_Level) < 0) {
      return 'Please enter a valid stock level';
    }
    if (isNaN(parseInt(data.Reorder_Level)) || parseInt(data.Reorder_Level) < 0) {
      return 'Please enter a valid reorder level';
    }
    return null;
  };
  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }
  
    try {
      const response = await fetch(`https://coogzoobackend.vercel.app/giftshop-items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
  
      await fetchItems(); // Refresh the list
    } catch (err) {
      setError('Failed to delete item');
      console.error(err);
    }
  };

  const handleToggleActive = async (itemId, currentStatus) => {
    try {
      const response = await fetch(`https://coogzoobackend.vercel.app/giftshop-items/${itemId}/toggle-active`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });

      if (!response.ok) throw new Error('Failed to toggle item status');
      
      await fetchItems();
    } catch (err) {
      setError('Failed to update item status');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      Name: '',
      Item_Description: '',
      Category: '',
      Price: '',
      Stock_Level: '',
      Reorder_Level: '',
      Image_URL: '',
      Is_Active: true
    });
    setEditingItem(null);
    setShowAddForm(false);
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setFormData({
      Name: item.Name,
      Item_Description: item.Item_Description,
      Category: item.Category,
      Price: item.Price.toString(),
      Stock_Level: item.Stock_Level,
      Reorder_Level: item.Reorder_Level,
      Image_URL: item.Image_URL,
      Is_Active: item.Is_Active
    });
    setShowAddForm(true);
  };

  if (!userRole || userRole !== 'Manager') {
    return <div className="access-denied">Access denied. Admin privileges required.</div>;
  }

  if (loading) {
    return <div className="loading-state">Loading...</div>;
  }

  const formatPrice = (price) => {
    const number = parseFloat(price);
    return isNaN(number) ? '0.00' : number.toFixed(2);
  };

  return (
    <div className="gift-manager-container">
      <div className="header-section">
        <h1>Gift Shop Manager</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="add-button"
        >
          ➕ Add New Item
        </button>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {showAddForm && (
        <div className="form-container">
          <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                name="Name"
                value={formData.Name}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input
                type="text"
                name="Category"
                value={formData.Category}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Price</label>
              <input
                type="number"
                name="Price"
                value={formData.Price}
                onChange={handleInputChange}
                className="form-input"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Stock Level</label>
              <input
                type="number"
                name="Stock_Level"
                value={formData.Stock_Level}
                onChange={handleInputChange}
                className="form-input"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Reorder Level</label>
              <input
                type="number"
                name="Reorder_Level"
                value={formData.Reorder_Level}
                onChange={handleInputChange}
                className="form-input"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input
                type="text"
                name="Image_URL"
                value={formData.Image_URL}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Description</label>
              <textarea
                name="Item_Description"
                value={formData.Item_Description}
                onChange={handleInputChange}
                className="form-textarea"
              />
            </div>
            <div className="button-group" style={{ gridColumn: '1 / -1' }}>
              <button type="submit" className="submit-button">
                {editingItem ? 'Update Item' : 'Add Item'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="items-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.Item_ID}>
                <td>{item.Name}</td>
                <td>{item.Category}</td>
                <td>${formatPrice(item.Price)}</td>
                <td>{item.Stock_Level}</td>
                <td>
                  <span className={`status-badge ${item.Is_Active ? 'active' : 'inactive'}`}>
                    {item.Is_Active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                <div className="action-buttons">
  <button
    onClick={() => startEdit(item)}
    className="edit-button"
    title="Edit Item"
  >
    ✏️
  </button>
  <button
    onClick={() => handleDelete(item.Item_ID)}
    className="delete-button"
    title="Delete Item"
  >
    🗑️
  </button>
  <button
    onClick={() => handleToggleActive(item.Item_ID, item.Is_Active)}
    className={`toggle-button ${item.Is_Active ? 'active' : 'inactive'}`}
    title={item.Is_Active ? 'Deactivate Item' : 'Activate Item'}
  >
    {item.Is_Active ? '❌' : '✔️'}
  </button>
</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GiftManager;