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
      
      const response = await fetch('http://localhost:5000/giftshop-items-all', {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = editingItem 
        ? `http://localhost:5000/giftshop-items/${editingItem.Item_ID}` 
        : 'http://localhost:5000/giftshop-items';
      
      const submissionData = {
        ...formData,
        Price: parseFloat(formData.Price)
      };

      const response = await fetch(endpoint, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) throw new Error('Failed to save item');
      
      await fetchItems();
      resetForm();
    } catch (err) {
      setError('Failed to save item');
      console.error(err);
    }
  };

  const handleToggleActive = async (itemId, currentStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/giftshop-items/${itemId}/toggle-active`, {
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
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold text-red-600">Access denied. Manager privileges required.</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl">Loading...</h2>
      </div>
    );
  }

  const formatPrice = (price) => {
    const number = parseFloat(price);
    return isNaN(number) ? '0.00' : number.toFixed(2);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gift Shop Manager</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          ➕ Add New Item
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="Name"
                value={formData.Name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                type="text"
                name="Category"
                value={formData.Category}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <input
                type="number"
                name="Price"
                value={formData.Price}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock Level</label>
              <input
                type="number"
                name="Stock_Level"
                value={formData.Stock_Level}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reorder Level</label>
              <input
                type="number"
                name="Reorder_Level"
                value={formData.Reorder_Level}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input
                type="text"
                name="Image_URL"
                value={formData.Image_URL}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="Item_Description"
                value={formData.Item_Description}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                rows="3"
              />
            </div>
            <div className="md:col-span-2 flex gap-4">
              <button 
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                {editingItem ? 'Update Item' : 'Add Item'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg shadow">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Category</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Price</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Stock</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.Item_ID}>
                <td className="px-6 py-4">{item.Name}</td>
                <td className="px-6 py-4">{item.Category}</td>
                <td className="px-6 py-4">${formatPrice(item.Price)}</td>
                <td className="px-6 py-4">{item.Stock_Level}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    item.Is_Active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.Is_Active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(item)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit Item"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleToggleActive(item.Item_ID, item.Is_Active)}
                      className={`hover:opacity-75 ${
                        item.Is_Active ? 'text-red-600' : 'text-green-600'
                      }`}
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