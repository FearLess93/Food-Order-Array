import { useState, useEffect } from 'react';
import api from '../services/api';
import { GroupOrder as GroupOrderType } from '../types';
import './GroupOrder.css';

export const GroupOrder = () => {
  const [groupOrder, setGroupOrder] = useState<GroupOrderType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroupOrder();
  }, []);

  const loadGroupOrder = async () => {
    try {
      const response = await api.get('/orders/group');
      if (response.data.success) {
        setGroupOrder(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load group order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading group order...</div>;
  }

  if (!groupOrder || groupOrder.orders.length === 0) {
    return (
      <div className="empty-state">
        <h2>No Orders Yet</h2>
        <p>No one has placed an order for today</p>
      </div>
    );
  }

  return (
    <div className="group-order-page">
      <div className="page-header">
        <h1>Group Order</h1>
        <div className="restaurant-info">
          <h2>{groupOrder.restaurant.name}</h2>
          <p>{groupOrder.restaurant.cuisine}</p>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-value">{groupOrder.totalOrders}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">BD {groupOrder.totalAmount.toFixed(2)}</div>
          <div className="stat-label">Total Amount</div>
        </div>
      </div>

      <div className="orders-list">
        {groupOrder.orders.map((order, index) => (
          <div key={index} className="order-card">
            <div className="order-header">
              <h3>{order.user.name}</h3>
              <span className="order-total">BD {order.totalAmount.toFixed(2)}</span>
            </div>
            <div className="order-items">
              {order.items.map((item, itemIndex) => (
                <div key={itemIndex} className="order-item">
                  <div className="item-details">
                    <span className="item-quantity">{item.quantity}x</span>
                    <span className="item-name">{item.menuItem.name}</span>
                    {item.notes && (
                      <p className="item-notes">Note: {item.notes}</p>
                    )}
                  </div>
                  <span className="item-price">BD {item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
