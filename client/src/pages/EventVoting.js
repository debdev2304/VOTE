import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Vote, 
  ArrowLeft, 
  Clock, 
  Users,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const EventVoting = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(`/api/voter/events/${eventId}`);
      setEvent(response.data.event);
    } catch (error) {
      console.error('Error fetching event details:', error);
      const message = error.response?.data?.error || 'Failed to load event details';
      toast.error(message);
      
      if (error.response?.data?.votedFor) {
        toast.error(`You have already voted for ${error.response.data.votedFor}`);
      }
      
      navigate('/voter');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedTeam) {
      toast.error('Please select a team to vote for');
      return;
    }

    setSubmitting(true);

    try {
      await axios.post(`/api/voter/events/${eventId}/vote`, {
        team: selectedTeam
      });

      toast.success('Vote cast successfully!');
      navigate(`/event/${eventId}/results`);
    } catch (error) {
      console.error('Error casting vote:', error);
      const message = error.response?.data?.error || 'Failed to cast vote';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist or is not active.</p>
          <button
            onClick={() => navigate('/voter')}
            className="btn btn-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/voter')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
              <p className="text-gray-600">Cast your vote</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-600 font-medium">Active</span>
          </div>
        </div>

        {/* Event Info */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Event Details</h3>
              {event.description && (
                <p className="text-gray-600 mb-4">{event.description}</p>
              )}
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Start: {formatDate(event.startDate)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>End: {formatDate(event.endDate)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{event.teams.length} teams to choose from</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Instructions</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Select one team from the options below</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>You can only vote once per event</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Your vote cannot be changed after submission</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Results will be available after voting ends</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Voting Options */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Your Vote</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {event.teams.map((team, index) => (
              <div
                key={index}
                onClick={() => setSelectedTeam(team.name)}
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedTeam === team.name
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: team.color }}
                    ></div>
                    <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                  </div>
                  {selectedTeam === team.name && (
                    <CheckCircle className="h-6 w-6 text-primary-600" />
                  )}
                </div>
                
                {team.description && (
                  <p className="text-gray-600 text-sm mb-3">{team.description}</p>
                )}
                
                <div
                  className="w-full h-2 rounded-full"
                  style={{ backgroundColor: team.color + '20' }}
                >
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ 
                      backgroundColor: team.color,
                      width: selectedTeam === team.name ? '100%' : '0%'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              onClick={handleVote}
              disabled={!selectedTeam || submitting}
              className="btn btn-primary px-8 py-3 text-lg"
            >
              {submitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting Vote...
                </div>
              ) : (
                <div className="flex items-center">
                  <Vote className="h-5 w-5 mr-2" />
                  Submit Vote
                </div>
              )}
            </button>
          </div>

          {!selectedTeam && (
            <p className="text-center text-gray-500 mt-4">
              Please select a team to continue
            </p>
          )}
        </div>

        {/* Warning */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Important</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Once you submit your vote, it cannot be changed. Please make sure you've selected the correct team before proceeding.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventVoting;
