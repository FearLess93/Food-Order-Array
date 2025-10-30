import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Restaurant, Group } from '../types';
import api from '../services/api';
import CreateGroupModal from '../components/CreateGroupModal';
import JoinPrivateGroupModal from '../components/JoinPrivateGroupModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinPrivate, setShowJoinPrivate] = useState(false);

  const { user, logout } = useAuthStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [restaurantsRes, publicGroupsRes, myGroupsRes] = await Promise.all([
        api.get('/restaurants'),
        api.get('/groups'), // Public groups
        api.get('/groups?myGroups=true'), // My groups (including private)
      ]);

      setRestaurants(restaurantsRes.data.data.restaurants);

      // Combine and deduplicate groups
      const publicGroups = publicGroupsRes.data.data.groups || [];
      const myGroups = myGroupsRes.data.data.groups || [];

      const allGroups = [...myGroups];
      publicGroups.forEach((group: Group) => {
        if (!allGroups.find((g) => g.id === group.id)) {
          allGroups.push(group);
        }
      });

      setGroups(allGroups);
    } catch (err: any) {
      setError('Failed to load data');
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (endAt: string) => {
    const end = new Date(endAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }
    return `${minutes}m left`;
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      await api.post(`/groups/${groupId}/join`);
      loadData(); // Reload to show updated member count
      alert('Successfully joined the group!');
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to join group');
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Array Food Ordering
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.name}
              </span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-8 flex flex-wrap gap-4">
          <button
            onClick={() => setShowCreateGroup(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            Create New Group
          </button>
          <button
            onClick={() => setShowJoinPrivate(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            Join Private Group
          </button>
        </div>

        {/* Active Groups */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Active Groups
          </h2>
          {groups.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">
                No active groups. Create one to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {group.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {group.restaurant.name}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        group.status === 'PUBLIC'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {group.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Owner: {group.owner.name}</p>
                    <p>Members: {group._count.members}</p>
                    <p className="font-medium text-orange-600">
                      {formatTimeRemaining(group.endAt)}
                    </p>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => navigate(`/groups/${group.id}`)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg transition duration-200 text-sm"
                    >
                      View Group
                    </button>
                    {group.ownerId !== user?.id && (
                      <button
                        onClick={() => handleJoinGroup(group.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition duration-200 text-sm"
                      >
                        Join
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Restaurants */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Available Restaurants
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-48 bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
                  {restaurant.logoUrl ? (
                    <img
                      src={restaurant.logoUrl}
                      alt={restaurant.name}
                      className="h-24 w-24 object-contain"
                    />
                  ) : (
                    <div className="text-4xl">🍽️</div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {restaurant.name}
                  </h3>
                  {restaurant.description && (
                    <p className="text-sm text-gray-600 mb-4">
                      {restaurant.description}
                    </p>
                  )}
                  <button
                    onClick={() => navigate(`/restaurants/${restaurant.id}`)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                  >
                    View Menu
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onSuccess={loadData}
      />

      {/* Join Private Group Modal */}
      <JoinPrivateGroupModal
        isOpen={showJoinPrivate}
        onClose={() => setShowJoinPrivate(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
