import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Vote, 
  ArrowLeft, 
  Clock, 
  Users,
  CheckCircle,
  AlertCircle,
  LogIn
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const PublicEvent = () => {
  const { votingUrl } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventDetails();
  }, [votingUrl]);

  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(`/api/events/public/${votingUrl}`);
      setEvent(response.data.event);
    } catch (error) {
      console.error('Error fetching event details:', error);
      toast.error('Event not found or not active');
    } finally {
      setLoading(false);
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
          <p className="mt-4 text-gray-600">Loading event...</p>
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
          <p className="text-gray-600 mb-4">This voting event doesn't exist or is not currently active.</p>
          <button
            onClick={() => navigate('/login')}
            className="btn btn-primary"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Go to Login
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
              onClick={() => navigate('/login')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
              <p className="text-gray-600">Voting Event</p>
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
                  <span>{event.teams.length} teams</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Vote className="h-4 w-4 mr-2" />
                  <span>{event.totalVotes} votes cast</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How to Vote</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>You need to be logged in as a voter to participate</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Each voter can only vote once per event</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Votes are anonymous and secure</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Results are updated in real-time</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Teams Preview */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Voting Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {event.teams.map((team, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <div
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: team.color }}
                  ></div>
                  <h3 className="font-semibold text-gray-900">{team.name}</h3>
                </div>
                {team.description && (
                  <p className="text-gray-600 text-sm">{team.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="card">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ready to Vote?</h3>
            <p className="text-gray-600 mb-6">
              Log in or create a voter account to participate in this voting event.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/login')}
                className="btn btn-primary"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login to Vote
              </button>
              
              <button
                onClick={() => navigate(`/results/${votingUrl}`)}
                className="btn btn-secondary"
              >
                <Vote className="h-4 w-4 mr-2" />
                View Results
              </button>
            </div>
          </div>
        </div>

        {/* Info Notice */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">Secure Voting</h4>
              <p className="text-sm text-blue-700 mt-1">
                This voting system ensures secure, anonymous, and transparent voting. Your vote is encrypted and cannot be traced back to you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicEvent;
