import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Vote, 
  ExternalLink, 
  Copy,
  Edit,
  Trash2,
  Eye,
  BarChart3
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/admin/events');
      setEvents(response.data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/events/${eventId}`);
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const copyVotingUrl = (votingUrl) => {
    const url = `${window.location.origin}/vote/${votingUrl}`;
    navigator.clipboard.writeText(url);
    toast.success('Voting URL copied to clipboard!');
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (!event.isActive) {
      return { status: 'Inactive', color: 'text-gray-500', bg: 'bg-gray-100' };
    }

    if (now < startDate) {
      return { status: 'Upcoming', color: 'text-blue-600', bg: 'bg-blue-100' };
    }

    if (now >= startDate && now <= endDate) {
      return { status: 'Active', color: 'text-green-600', bg: 'bg-green-100' };
    }

    return { status: 'Ended', color: 'text-red-600', bg: 'bg-red-100' };
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
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600">Manage your voting events</p>
        </div>
        <Link
          to="/admin/create"
          className="btn btn-primary"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
          <p className="text-gray-600 mb-6">Create your first voting event to get started</p>
          <Link to="/admin/create" className="btn btn-primary">
            Create Event
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {events.map((event) => {
            const status = getEventStatus(event);
            return (
              <div key={event._id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.bg} ${status.color}`}>
                        {status.status}
                      </span>
                    </div>
                    
                    {event.description && (
                      <p className="text-gray-600 mb-4">{event.description}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Start: {formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>End: {formatDate(event.endDate)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Vote className="h-4 w-4 mr-2" />
                        <span>{event.totalVotes} votes</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Teams:</span>
                      <div className="flex flex-wrap gap-2">
                        {event.teams.map((team, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs font-medium rounded"
                            style={{ 
                              backgroundColor: team.color + '20', 
                              color: team.color,
                              border: `1px solid ${team.color}40`
                            }}
                          >
                            {team.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => copyVotingUrl(event.votingUrl)}
                      className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                      title="Copy voting URL"
                    >
                      <Copy className="h-4 w-4" />
                    </button>

                    <Link
                      to={`/admin/events/${event._id}`}
                      className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                      title="View statistics"
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Link>

                    <Link
                      to={`/vote/${event.votingUrl}`}
                      target="_blank"
                      className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                      title="View voting page"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>

                    <button
                      onClick={() => deleteEvent(event._id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete event"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Voting URL */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-1">Voting URL</p>
                      <p className="text-sm text-gray-600 font-mono">
                        {window.location.origin}/vote/{event.votingUrl}
                      </p>
                    </div>
                    <button
                      onClick={() => copyVotingUrl(event.votingUrl)}
                      className="btn btn-secondary text-sm"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventList;
