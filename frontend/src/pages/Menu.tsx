import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { MenuItem, OrderItem } from '../types';
import './Menu.css';

export const Menu = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<Map<string, OrderItem>>(new Map());
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    loadMenu();
  }, [restaurantId]);

  const loadMenu = async () => {
    try {
      const response = await api.get(`/menu/restaurant/${restaurantId}`);
      if (response.data.success) {
        setMenuItems(response.data.data.menu);
      }
    } catch (error) {
      alert('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    if (!selectedItem) return;

    const newCart = new Map(cart);
    newCart.set(selectedItem.id, {
      menuItemId: selectedItem.id,
      quantity,
      notes: notes || undefined,
    });
    setCart(newCart);
    setSelectedItem(null);
    setQuantity(1);
    setNotes('');
  };

  const removeFromCart = (itemId: string) => {
    const newCart = new Map(cart);
    newCart.delete(itemId);
    setCart(newCart);
  };

  const placeOrder = async () => {
    if (cart.size === 0) {
      alert('Please add items to your cart');
      return;
    }

    setPlacing(true);
    try {
      const items = Array.from(cart.values());
      const response = await api.post('/orders', {
        restaurantId,
        items,
      });

      if (response.data.success) {
        alert('Order placed successfully!');
        navigate('/group-order');
      }
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading menu...</div>;
  }

  return (
    <div className="menu-page">
      <div className="page-header">
        <h1>Menu</h1>
        <p>Cart: {cart.size} items</p>
      </div>

      <div className="menu-grid">
        {menuItems.map((item) => (
          <div key={item.id} className="menu-item-card">
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.name} />
            )}
            <div className="menu-item-info">
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <div className="menu-item-footer">
                <span className="price">BD {item.price.toFixed(2)}</span>
                <button
                  className="btn-add"
                  onClick={() => {
                    setSelectedItem(item);
                    setQuantity(1);
                    setNotes('');
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {cart.size > 0 && (
        <div className="cart-summary">
          <h3>Your Cart ({cart.size} items)</h3>
          <div className="cart-items">
            {Array.from(cart.entries()).map(([itemId, orderItem]) => {
              const menuItem = menuItems.find(m => m.id === itemId);
              return (
                <div key={itemId} className="cart-item">
                  <div>
                    <strong>{menuItem?.name}</strong>
                    <span> x{orderItem.quantity}</span>
                    {orderItem.notes && <p className="notes">{orderItem.notes}</p>}
                  </div>
                  <button onClick={() => removeFromCart(itemId)} className="btn-remove">
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
          <button
            className="btn-primary btn-place-order"
            onClick={placeOrder}
            disabled={placing}
          >
            {placing ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      )}

      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedItem.name}</h2>
            <p className="modal-price">BD {selectedItem.price.toFixed(2)}</p>

            <div className="quantity-selector">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>

            <textarea
              placeholder="Special instructions (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />

            <div className="modal-buttons">
              <button className="btn-secondary" onClick={() => setSelectedItem(null)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={addToCart}>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
