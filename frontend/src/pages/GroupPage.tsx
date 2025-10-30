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

interface GroupDetails {
  id: string;
  name: string;
  status: string;
  endAt: string;
  isClosed: boolean;
  restaurant: {
    id: string;
    name: string;
    description: string;
  };
  owner: {
    id: string;
    name: string;
  };
  _count: {
    members: number;
  };
}

export default function GroupPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGroupData();
  }, [id]);

  const loadGroupData = async () => {
    try {
      // First load the group
      const groupRes = await api.get(`/groups/${id}`);
      const groupData = groupRes.data.data.group;
      setGroup(groupData);

      // Then load menu for the restaurant
      const restaurantMenuRes = await api.get(`/restaurants/${groupData.restaurant.id}/menu`);
      setMenuItems(restaurantMenuRes.data.data.menuItems || []);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load group');
      console.error('Load group error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (menuItemId: string) => {
    try {
      await api.post(`/groups/${id}/cart`, {
        menuItemId,
        quantity: 1,
      });
      alert('Added to cart!');
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to add to cart');
    }
  };

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

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Group not found'}</p>
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
            <h1 className="text-xl font-bold text-gray-900">{group.name}</h1>
            <span className="text-sm text-gray-600">{user?.name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Group Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{group.restaurant.name}</h2>
              <p className="text-gray-600 mb-4">{group.restaurant.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Owner: {group.owner.name}</span>
                <span>•</span>
                <span>Members: {group._count.members}</span>
                <span>•</span>
                <span className={group.isClosed ? 'text-red-600' : 'text-green-600'}>
                  {group.isClosed ? 'Closed' : 'Open'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Menu</h3>
          {menuItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">No menu items available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">{item.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-red-600">
                        BD {item.price.toFixed(3)}
                      </span>
                      <button
                        onClick={() => addToCart(item.id)}
                        disabled={group.isClosed}
                        className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add to Cart
                      </button>
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
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
