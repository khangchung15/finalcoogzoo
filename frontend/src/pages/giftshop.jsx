import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import './giftshop.css';

const GiftShopPage = () => {
  const { userRole, userEmail } = useAuth();
  // Make the check case-insensitive
  const isCustomer = userRole?.toLowerCase() === 'customer';

  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [debug, setDebug] = useState({ userRole, userEmail, isCustomer });

  useEffect(() => {
    setDebug({ userRole, userEmail, isCustomer });
  }, [userRole, userEmail, isCustomer]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Always fetch items regardless of user role
        await fetchGiftShopItems();
        
        // Only fetch purchase history for logged-in customers
        if (isCustomer && userEmail) {
          await fetchPurchaseHistory();
        }
      } catch (err) {
        console.error('Error loading gift shop data:', err);
        setError('Failed to load gift shop data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isCustomer, userEmail]);

  const fetchGiftShopItems = async () => {
    try {
      const response = await fetch('https://coogzootestbackend-phi.vercel.app/giftshop-items');
      if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      const formattedData = data.map(item => ({
        ...item,
        Price: parseFloat(item.Price)
      }));
      setItems(formattedData);
    } catch (err) {
      console.error('Error fetching gift shop items:', err);
      throw err;
    }
  };

  const fetchPurchaseHistory = async () => {
    try {
      const response = await fetch(`https://coogzootestbackend-phi.vercel.app/giftshop-history?email=${encodeURIComponent(userEmail)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      const formattedHistory = data.map(item => ({
        ...item,
        Price: parseFloat(item.Price)
      }));
      setPurchasedItems(formattedHistory);
    } catch (err) {
      console.error('Error fetching purchase history:', err);
      throw err;
    }
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!selectedItem || !isCustomer || !userEmail) {
      setError('Unable to complete purchase. Please ensure you are logged in as a customer.');
      return;
    }

    try {
      setError(null);
      const response = await fetch('https://coogzootestbackend-phi.vercel.app/purchase-giftshop-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          itemId: selectedItem.Item_ID,
          quantity: quantity
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Purchase failed');
      }

      setPurchaseSuccess(true);
      setSelectedItem(null);
      setQuantity(1);
      await fetchGiftShopItems();
      await fetchPurchaseHistory();
      
      setTimeout(() => setPurchaseSuccess(false), 3000);
    } catch (err) {
      console.error('Error purchasing item:', err);
      setError(err.message || 'Failed to complete purchase. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="giftshop-container">
        <div className="loading-message">Loading gift shop data...</div>
      </div>
    );
  }

  const debugInfo = process.env.NODE_ENV === 'development' && (
    <div className="debug-info" style={{ margin: '10px', padding: '10px', background: '#f0f0f0' }}>
      <h3>Debug Information</h3>
      <pre>{JSON.stringify(debug, null, 2)}</pre>
    </div>
  );

  // Group items by category
  const itemsByCategory = items.reduce((acc, item) => {
    if (!acc[item.Category]) {
      acc[item.Category] = [];
    }
    acc[item.Category].push(item);
    return acc;
  }, {});

  if (loading) {
    return <div className="giftshop-container">Loading...</div>;
  }

  if (!isCustomer) {
    return (
      <div className="giftshop-container">
        <h1>Gift Shop</h1>
        <div className="no-access">
          Please log in as a customer to make purchases.
        </div>
      </div>
    );
  }

  return (
    <div className="giftshop-container">
      <h1>Gift Shop</h1>
      
      {debugInfo}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {purchaseSuccess && (
        <div className="purchase-success">
          Purchase successful!
        </div>
      )}

      {!isCustomer && (
        <div className="no-access">
          <p>Please log in as a customer to make purchases.</p>
          <p>Current role: {userRole || 'Not logged in'}</p>
        </div>
      )}

      {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
        <div key={category} className="category-section">
          <h2>{category}</h2>
          <div className="items-grid">
            {categoryItems.map((item) => (
              <div 
                key={item.Item_ID} 
                className={`item-card ${selectedItem?.Item_ID === item.Item_ID ? 'selected' : ''}`}
              >
                <img 
                  src={item.Image_URL} 
                  alt={item.Name}
                  className="item-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
                <h3>{item.Name}</h3>
                <p className="item-description">{item.Item_Description}</p>
                <p className="item-price">
                  ${typeof item.Price === 'number' ? item.Price.toFixed(2) : parseFloat(item.Price).toFixed(2)}
                </p>
                <p className="stock-level">
                  In Stock: {item.Stock_Level}
                </p>
                <button
                  className="select-button"
                  onClick={() => setSelectedItem(item)}
                  disabled={item.Stock_Level === 0}
                >
                  {item.Stock_Level === 0 ? 'Out of Stock' : 'Select Item'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {selectedItem && (
        <div className="purchase-modal">
          <div className="purchase-form">
            <h3>Purchase {selectedItem.Name}</h3>
            <p className="item-description">{selectedItem.Item_Description}</p>
            <p className="item-price">
              Price: ${typeof selectedItem.Price === 'number' ? 
                selectedItem.Price.toFixed(2) : 
                parseFloat(selectedItem.Price).toFixed(2)}
            </p>
            
            <div className="quantity-selector">
              <label htmlFor="quantity">Quantity:</label>
              <input
                type="number"
                id="quantity"
                min="1"
                max={selectedItem.Stock_Level}
                value={quantity}
                onChange={(e) => setQuantity(Math.min(
                  Math.max(1, parseInt(e.target.value) || 1),
                  selectedItem.Stock_Level
                ))}
              />
            </div>
            
            <p className="total-price">
              Total: ${(selectedItem.Price * quantity).toFixed(2)}
            </p>
            
            <div className="purchase-buttons">
              <button 
                className="purchase-button"
                onClick={handlePurchase}
              >
                Purchase
              </button>
              <button 
                className="cancel-button"
                onClick={() => setSelectedItem(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {purchasedItems.length > 0 && (
        <div className="purchase-history-section">
          <h2>Purchase History</h2>
          <div className="history-grid">
            {purchasedItems.map((item, index) => (
              <div key={index} className="history-card">
                <img 
                  src={item.Image_URL} 
                  alt={item.Name}
                  className="history-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
                <div className="history-details">
                  <h3>{item.Name}</h3>
                  <p>{item.Item_Description}</p>
                  <p>Category: {item.Category}</p>
                  <p>Quantity: {item.Quantity}</p>
                  <p>Total Price: ${typeof item.Price === 'number' ? 
                    item.Price.toFixed(2) : 
                    parseFloat(item.Price).toFixed(2)}
                  </p>
                  <p>Purchased: {new Date(item.Purchase_Date).toLocaleDateString()}</p>
                  <p>Receipt ID: {item.Receipt_ID}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftShopPage;