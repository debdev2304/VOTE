import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Copy, Calendar, Users } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CreateEvent = ({ onEventCreated }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    teams: [
      { name: '', description: '', color: '#3B82F6' },
      { name: '', description: '', color: '#EF4444' }
    ]
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTeamChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      teams: prev.teams.map((team, i) => 
        i === index ? { ...team, [field]: value } : team
      )
    }));
  };

  const addTeam = () => {
    setFormData(prev => ({
      ...prev,
      teams: [...prev.teams, { name: '', description: '', color: '#10B981' }]
    }));
  };

  const removeTeam = (index) => {
    if (formData.teams.length > 2) {
      setFormData(prev => ({
        ...prev,
        teams: prev.teams.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Event name is required');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error('Start and end dates are required');
      return;
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    const validTeams = formData.teams.filter(team => team.name.trim());
    if (validTeams.length < 2) {
      toast.error('At least 2 teams are required');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/admin/events', {
        ...formData,
        teams: validTeams
      });

      toast.success('Event created successfully!');
      
      if (onEventCreated) {
        onEventCreated();
      }

      // Show voting URL
      const votingUrl = `${window.location.origin}/vote/${response.data.event.votingUrl}`;
      toast.success(
        <div>
          <p>Voting URL created!</p>
          <div className="flex items-center mt-2">
            <input
              type="text"
              value={votingUrl}
              readOnly
              className="flex-1 px-2 py-1 text-sm border rounded mr-2"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(votingUrl);
                toast.success('URL copied to clipboard!');
              }}
              className="text-primary-600 hover:text-primary-700"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>,
        { duration: 10000 }
      );

      navigate('/admin/events');
    } catch (error) {
      console.error('Error creating event:', error);
      const message = error.response?.data?.error || 'Failed to create event';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="flex items-center mb-6">
          <Plus className="h-6 w-6 text-primary-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="label">
                Event Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input"
                placeholder="Enter event name"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="input"
                rows="3"
                placeholder="Enter event description"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="label">
                <Calendar className="inline h-4 w-4 mr-1" />
                Start Date *
              </label>
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="input"
                required
              />
            </div>

            <div>
              <label htmlFor="endDate" className="label">
                <Calendar className="inline h-4 w-4 mr-1" />
                End Date *
              </label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="input"
                required
              />
            </div>
          </div>

          {/* Teams */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="label mb-0">
                <Users className="inline h-4 w-4 mr-1" />
                Voting Teams *
              </label>
              <button
                type="button"
                onClick={addTeam}
                className="btn btn-secondary text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Team
              </button>
            </div>

            <div className="space-y-4">
              {formData.teams.map((team, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="md:col-span-2">
                    <label className="label text-sm">Team Name *</label>
                    <input
                      type="text"
                      value={team.name}
                      onChange={(e) => handleTeamChange(index, 'name', e.target.value)}
                      className="input"
                      placeholder="Enter team name"
                      required
                    />
                  </div>

                  <div>
                    <label className="label text-sm">Description</label>
                    <input
                      type="text"
                      value={team.description}
                      onChange={(e) => handleTeamChange(index, 'description', e.target.value)}
                      className="input"
                      placeholder="Team description"
                    />
                  </div>

                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <label className="label text-sm">Color</label>
                      <input
                        type="color"
                        value={team.color}
                        onChange={(e) => handleTeamChange(index, 'color', e.target.value)}
                        className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                    </div>

                    {formData.teams.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeTeam(index)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/events')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
