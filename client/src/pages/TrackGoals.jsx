import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Target, Plus, ArrowLeft, Trash2, Edit2, Check } from 'lucide-react';
import api from '../utils/api';
import logger from '../utils/logger';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/ui/toaster';

const TrackGoals = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'skill_acquisition',
    targetDate: '',
    actionItems: [],
  });
  const [newActionItem, setNewActionItem] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      const response = await api.get('/goals');
      setGoals(response.data.data || []);
    } catch (error) {
      logger.error('Error fetching goals', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/goals', formData);
      toast('Goal created successfully!', 'success');
      setShowAddModal(false);
      setFormData({
        title: '',
        description: '',
        category: 'learning',
        priority: 'medium',
        targetDate: '',
        progress: 0,
      });
      fetchGoals();
    } catch (error) {
      toast(error.response?.data?.message || 'Failed to create goal', 'error');
    }
  };

  const handleUpdateProgress = async (goalId, newProgress) => {
    try {
      const newStatus = newProgress >= 100 ? 'completed' : newProgress > 0 ? 'in_progress' : 'not_started';
      await api.put(`/goals/${goalId}`, { progress: newProgress, status: newStatus });
      fetchGoals();
      toast('Progress updated!', 'success');
    } catch (error) {
      toast('Failed to update progress', 'error');
    }
  };

  const handleDelete = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await api.delete(`/goals/${goalId}`);
      toast('Goal deleted successfully', 'success');
      fetchGoals();
    } catch (error) {
      toast('Failed to delete goal', 'error');
    }
  };

  const filteredGoals = filterStatus === 'all' 
    ? goals 
    : goals.filter(g => g.status === filterStatus);

  const stats = {
    total: goals.length,
    completed: goals.filter(g => g.status === 'completed').length,
    inProgress: goals.filter(g => g.status === 'in_progress').length,
    notStarted: goals.filter(g => g.status === 'not_started').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 bg-neutral-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-neutral-900 mb-2">Track Goals</h1>
                <p className="text-neutral-600">Set and track your mentorship and learning goals</p>
              </div>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-neutral-600 mb-1">Total Goals</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-neutral-600 mb-1">In Progress</p>
                <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-neutral-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-neutral-600 mb-1">Not Started</p>
                <p className="text-3xl font-bold text-neutral-500">{stats.notStarted}</p>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex gap-2">
                {['all', 'not_started', 'in_progress', 'completed'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      filterStatus === status
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Goals List */}
          {filteredGoals.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Target className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-600 text-lg">No goals found.</p>
                  <p className="text-neutral-500 text-sm mt-2">
                    Click "Add Goal" to create your first goal!
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredGoals.map((goal, index) => (
                <motion.div
                  key={goal._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-neutral-900">{goal.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                              goal.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-neutral-100 text-neutral-800'
                            }`}>
                              {goal.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                              goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {goal.priority} priority
                            </span>
                          </div>
                          {goal.description && (
                            <p className="text-neutral-600 mb-3">{goal.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-neutral-500">
                            <span className="capitalize">{goal.category}</span>
                            {goal.targetDate && (
                              <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(goal._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-600">Progress</span>
                          <span className="font-semibold">{goal.progress}%</span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={goal.progress}
                            onChange={(e) => {
                              const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                              handleUpdateProgress(goal._id, val);
                            }}
                            className="w-24"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateProgress(goal._id, 100)}
                            disabled={goal.progress === 100}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Mark Complete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold mb-4">Add New Goal</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="e.g., Learn React"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows="3"
                    placeholder="What do you want to achieve?"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="learning">Learning</option>
                    <option value="skill">Skill</option>
                    <option value="career">Career</option>
                    <option value="project">Project</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="targetDate">Target Date</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Create Goal
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default TrackGoals;

