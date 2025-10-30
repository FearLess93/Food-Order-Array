import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Restaurant, VotingResults } from '../types';
import './Voting.css';

export const Voting = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVotingActive, setIsVotingActive] = useState(false);
  const [votingResults, setVotingResults] = useState<VotingResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadVotingData();
  }, []);

  const loadVotingData = async () => {
    try {
      const [restaurantsRes, hasVotedRes, isActiveRes, resultsRes] = await Promise.all([
        api.get('/voting/available'),
        api.get('/voting/has-voted'),
        api.get('/voting/is-active'),
        api.get('/voting/results'),
      ]);

      if (restaurantsRes.data.success) {
        setRestaurants(restaurantsRes.data.data.restaurants);
      }
      if (hasVotedRes.data.success) {
        setHasVoted(hasVotedRes.data.data.hasVoted);
      }
      if (isActiveRes.data.success) {
        setIsVotingActive(isActiveRes.data.data.isActive);
      }
      if (resultsRes.data.success) {
        setVotingResults(resultsRes.data.data);
      }
    } catch (error) {
      console.error('Failed to load voting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (restaurantId: string) => {
    if (hasVoted || !isVotingActive) return;

    setVoting(true);
    try {
      const response = await api.post('/voting/vote', { restaurantId });
      if (response.data.success) {
        alert('Vote cast successfully!');
        setHasVoted(true);
        loadVotingData();
      }
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to cast vote');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="voting-page">
      <div className="page-header">
        <h1>Vote for Today's Restaurant</h1>
        {!isVotingActive && <p className="status-text closed">Voting is closed</p>}
        {hasVoted && <p className="status-text voted">✓ You've voted today!</p>}
      </div>

      {votingResults?.winner && (
        <div className="winner-card">
          <h2>🏆 Winner</h2>
          <h3>{votingResults.winner.name}</h3>
          <p>{votingResults.winner.cuisine}</p>
          <button
            className="btn-primary"
            onClick={() => navigate(`/menu/${votingResults.winner!.id}`)}
          >
            View Menu & Order
          </button>
        </div>
      )}

      <div className="restaurants-grid">
        {restaurants.map((restaurant) => {
          const voteCount = votingResults?.restaurants.find(
            r => r.restaurant.id === restaurant.id
          )?.voteCount || 0;

          return (
            <div
              key={restaurant.id}
              className={`restaurant-card ${hasVoted || !isVotingActive || voting ? 'disabled' : ''}`}
              onClick={() => handleVote(restaurant.id)}
            >
              {restaurant.imageUrl && (
                <img src={restaurant.imageUrl} alt={restaurant.name} />
              )}
              <div className="restaurant-info">
                <h3>{restaurant.name}</h3>
                <p>{restaurant.cuisine}</p>
                {votingResults?.isComplete && (
                  <span className="vote-count">{voteCount} votes</span>
                )}
              </div>
              {hasVoted && <div className="voted-badge">✓</div>}
            </div>
          );
        })}
      </div>

      {restaurants.length === 0 && (
        <p className="empty-text">No restaurants available for voting</p>
      )}
    </div>
  );
};
