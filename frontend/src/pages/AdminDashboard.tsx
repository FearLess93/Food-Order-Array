import { useState, useEffect } from 'react';
import api from '../services/api';
import './AdminDashboard.css';

export const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [dailyRes, overviewRes] = await Promise.all([
        api.get('/admin/stats/daily'),
        api.get('/admin/stats/overview'),
      ]);

      setStats({
        daily: dailyRes.data.data,
        overview: overviewRes.data.data,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportOrders = async () => {
    try {
      const response = await api.get('/orders/export/download?format=csv', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to export orders');
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="dashboard-section">
        <h2>Today's Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.daily.totalVotes}</div>
            <div className="stat-label">Total Votes</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.daily.participationRate.toFixed(1)}%</div>
            <div className="stat-label">Participation Rate</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.daily.totalOrders}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">BD {stats.daily.totalRevenue.toFixed(2)}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>

        {stats.daily.winningRestaurant && (
          <div className="winner-info">
            <h3>🏆 Today's Winner</h3>
            <p className="winner-name">{stats.daily.winningRestaurant.name}</p>
            <p className="winner-votes">{stats.daily.winningRestaurant.voteCount} votes</p>
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <h2>System Overview</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.overview.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.overview.totalActiveRestaurants}</div>
            <div className="stat-label">Active Restaurants</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.overview.totalOrders}</div>
            <div className="stat-label">All-Time Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">BD {stats.overview.totalRevenue.toFixed(2)}</div>
            <div className="stat-label">All-Time Revenue</div>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Actions</h2>
        <div className="actions-grid">
          <button className="action-btn" onClick={exportOrders}>
            📥 Export Today's Orders
          </button>
          <button className="action-btn" onClick={() => alert('Feature coming soon')}>
            🍽️ Manage Restaurants
          </button>
          <button className="action-btn" onClick={() => alert('Feature coming soon')}>
            📋 Manage Menus
          </button>
          <button className="action-btn" onClick={() => alert('Feature coming soon')}>
            🗳️ Close Voting
          </button>
        </div>
      </div>
    </div>
  );
};
