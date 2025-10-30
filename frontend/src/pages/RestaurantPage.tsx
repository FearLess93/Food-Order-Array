import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  tags: string[];
  imageUrl?: string;
}

interface Restaurant {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
}

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRestaurantData();
  }, [id]);

  const loadRestaurantData = async () => {
    try {
      const [restaurantRes, menuRes] = await Promise.all([
        api.get(`/restaurants/${id}`),
        api.get(`/restaurants/${id}/menu`),
      ]);

      setRestaurant(restaurantRes.data.data.restaurant);
      setMenuItems(menuRes.data.data.menuItems || []);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load restaurant');
      console.error('Load restaurant error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Group menu items by category based on tags
  const groupedItems = menuItems.reduce((acc, item) => {
    // Determine category
    let category = 'Other';
    if (item.tags.includes('popular')) {
      category = 'Picks for You';
    } else if (item.tags.includes('vegetarian') || item.tags.includes('vegan')) {
      category = 'Appetizers & Salads';
    } else if (item.name.toLowerCase().includes('sandwich') || item.name.toLowerCase().includes('shawarma')) {
      category = 'Sandwiches';
    } else if (item.name.toLowerCase().includes('chicken') || item.name.toLowerCase().includes('meat')) {
      category = 'Main Dishes';
    }

    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Restaurant not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <h1 className="text-xl font-bold text-gray-900">{restaurant.name}</h1>
            <span className="text-sm text-gray-600">{user?.name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Restaurant Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-6">
            {restaurant.logoUrl && (
              <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg flex items-center justify-center">
                <img
                  src={restaurant.logoUrl}
                  alt={restaurant.name}
                  className="w-16 h-16 object-contain"
                />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{restaurant.name}</h2>
              <p className="text-gray-600">{restaurant.description}</p>
            </div>
          </div>
        </div>

        {/* Menu by Category */}
        {Object.entries(groupedItems).map(([category, items]) => (
          <section key={category} className="mb-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <h4 className="font-semibold text-gray-900 mb-2">{item.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-red-600">
                      BD {item.price.toFixed(3)}
                    </span>
                  </div>
                  {item.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
