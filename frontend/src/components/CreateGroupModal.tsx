import { useState, useEffect } from 'react';
import { Restaurant } from '../types';
import api from '../services/api';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateGroupModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateGroupModalProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    restaurantId: '',
    status: 'PUBLIC' as 'PUBLIC' | 'PRIVATE',
    durationMinutes: 60,
    maxMembers: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadRestaurants();
    }
  }, [isOpen]);

  const loadRestaurants = async () => {
    try {
      const response = await api.get('/restaurants');
      setRestaurants(response.data.data.restaurants);
    } catch (err) {
      setError('Failed to load restaurants');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        restaurantId: formData.restaurantId,
        status: formData.status,
        durationMinutes: formData.durationMinutes,
        ...(formData.maxMembers && { maxMembers: parseInt(formData.maxMembers) }),
      };

      const response = await api.post('/groups', payload);

      if (response.data.success) {
        if (response.data.data.group.joinCode) {
          setJoinCode(response.data.data.group.joinCode);
        } else {
          onSuccess();
          handleClose();
        }
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || 'Failed to create group';
      if (errorMsg.includes('Foreign key constraint') || errorMsg.includes('owner')) {
        setError('Authentication error. Please logout and login again.');
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      restaurantId: '',
      status: 'PUBLIC',
      durationMinutes: 60,
      maxMembers: '',
    });
    setError('');
    setJoinCode('');
    onClose();
  };

  const copyJoinCode = () => {
    navigator.clipboard.writeText(joinCode);
  };

  if (!isOpen) return null;

  // Show join code after successful private group creation
  if (joinCode) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4 text-green-600">
            Group Created Successfully!
          </h3>

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">
              Your private group has been created. Share this join code with your
              colleagues:
            </p>

            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <div className="text-2xl font-mono font-bold text-gray-900 mb-2">
                {joinCode}
              </div>
              <button
                onClick={copyJoinCode}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                📋 Copy Code
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              onSuccess();
              handleClose();
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Create New Group</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              minLength={3}
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Lunch Order - Oct 30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Restaurant
            </label>
            <select
              value={formData.restaurantId}
              onChange={(e) =>
                setFormData({ ...formData, restaurantId: e.target.value })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Select a restaurant</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="PUBLIC"
                  checked={formData.status === 'PUBLIC'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as 'PUBLIC' | 'PRIVATE',
                    })
                  }
                  className="mr-2"
                />
                <span className="text-sm">Public (anyone can join)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="PRIVATE"
                  checked={formData.status === 'PRIVATE'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as 'PUBLIC' | 'PRIVATE',
                    })
                  }
                  className="mr-2"
                />
                <span className="text-sm">Private (join code required)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration
            </label>
            <select
              value={formData.durationMinutes}
              onChange={(e) =>
                setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={240}>4 hours</option>
              <option value={480}>8 hours</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Members (optional)
            </label>
            <input
              type="number"
              value={formData.maxMembers}
              onChange={(e) =>
                setFormData({ ...formData, maxMembers: e.target.value })
              }
              min={2}
              max={50}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="No limit"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
