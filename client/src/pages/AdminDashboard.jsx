import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Users, AlertCircle, TrendingUp, CheckCircle, XCircle, Search } from 'lucide-react';
import api from '../utils/api';
import { toast } from '../components/ui/toaster';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    approvedMentors: 0,
    pendingMentors: 0,
    totalBookings: 0,
    openIssues: 0,
    totalCategories: 0,
  });
  const [allMentors, setAllMentors] = useState([]);
  const [issues, setIssues] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Pending');
  const [loading, setLoading] = useState(true);

  const updateIssueStatus = async (issueId, status) => {
    try {
      await api.put(`/issues/${issueId}`, { status });
      toast(`Issue marked as ${status.replace('_', ' ')}`, 'success');
      fetchData();
    } catch (error) {
      console.error('Error updating issue status:', error);
      toast('Failed to update issue', 'error');
    }
  };

  const updateIssueRemark = async (issueId) => {
    const remark = window.prompt('Add remark for this issue:');
    if (remark === null) return; // cancelled
    try {
      await api.put(`/issues/${issueId}`, { remark });
      toast('Remark saved', 'success');
      fetchData();
    } catch (error) {
      console.error('Error adding remark:', error);
      toast('Failed to add remark', 'error');
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch all data for the dashboard
  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, mentorsRes, issuesRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/all-mentors'),
        api.get('/issues'),
      ]);

      setStats(statsRes.data.data || stats);
      setAllMentors(mentorsRes.data.data || []);
      setIssues(issuesRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Approve a mentor
  const handleApproveMentor = async (mentorId) => {
    try {
      await api.put(`/admin/mentor/approve/${mentorId}`);
      toast('Mentor approved successfully', 'success');
      fetchData();
    } catch (error) {
      console.error('Error approving mentor:', error);
      toast(error.response?.data?.message || 'Failed to approve mentor', 'error');
    }
  };

  // Reject a mentor
  const handleRejectMentor = async (mentorId) => {
    try {
      await api.put(`/admin/mentor/reject/${mentorId}`);
      toast('Mentor request rejected', 'success');
      fetchData();
    } catch (error) {
      console.error('Error rejecting mentor:', error);
      toast('Failed to reject mentor', 'error');
    }
  };

  // Filter mentors based on search term and status
  const filteredMentors = allMentors.filter((mentor) => {
    // Filter by status
    if (filterStatus === 'Pending' && mentor.isApproved !== false) return false;
    if (filterStatus === 'Approved' && mentor.isApproved !== true) return false;
    if (filterStatus === 'Rejected' && mentor.isApproved !== false) return false; // Note: rejected mentors are deleted, so this may be empty

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        mentor.user?.name?.toLowerCase().includes(searchLower) ||
        mentor.user?.email?.toLowerCase().includes(searchLower) ||
        mentor.skills?.some((skill) => skill.toLowerCase().includes(searchLower)) ||
        mentor.categories?.some((cat) => cat.toLowerCase().includes(searchLower)) ||
        mentor.bio?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-1 bg-neutral-50 dark:bg-neutral-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage mentor approvals and platform issues</p>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pending Approvals</p>
                    <p className="text-3xl font-bold text-foreground">{stats.pendingMentors || 0}</p>
                  </div>
                  <Users className="h-10 w-10 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Open Issues</p>
                    <p className="text-3xl font-bold text-foreground">{stats.openIssues || 0}</p>
                  </div>
                  <AlertCircle className="h-10 w-10 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalUsers || 0}</p>
                  </div>
                  <Users className="h-10 w-10 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Mentors</p>
                    <p className="text-3xl font-bold text-foreground">{stats.approvedMentors || 0}</p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-border mb-6">
            {['overview', 'requests', 'issues'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-4 font-medium transition ${activeTab === tab ? 'text-primary-600 border-b-2 border-primary-600' : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold text-foreground">{stats.totalUsers || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Approved Mentors</p>
                      <p className="text-2xl font-bold text-foreground">{stats.approvedMentors || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Mentors</p>
                      <p className="text-2xl font-bold text-foreground">{stats.pendingMentors || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Bookings</p>
                      <p className="text-2xl font-bold text-foreground">{stats.totalBookings || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Open Issues</p>
                      <p className="text-2xl font-bold text-foreground">{stats.openIssues || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Categories</p>
                      <p className="text-2xl font-bold text-foreground">{stats.totalCategories || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => {
                        setActiveTab('requests');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Review Mentor Requests ({stats.pendingMentors})
                    </Button>
                    <Button
                      onClick={() => {
                        setActiveTab('issues');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                      View Platform Issues ({stats.openIssues})
                    </Button>
                    <Button
                      onClick={fetchData}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                    >
                      Refresh Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'requests' && (
            <Card>
              <CardHeader>
                <CardTitle>Mentor Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="mb-6 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, title, or expertise..."
                      className="pl-10 bg-background text-foreground"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    {['All', 'Pending', 'Approved'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${filterStatus === status
                            ? 'bg-primary-600 text-white'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mentor List */}
                <div className="space-y-4">
                  {filteredMentors.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No mentor requests found</p>
                  ) : (
                    filteredMentors.map((mentor) => (
                      <motion.div
                        key={mentor._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-6 border border-border rounded-lg hover:shadow-md transition bg-card text-card-foreground"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="font-bold text-lg text-foreground">{mentor.user?.name}</p>
                              <span className={`px-3 py-1 text-sm rounded-full ${mentor.isApproved
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                                }`}>
                                {mentor.isApproved ? 'Approved' : 'Pending'}
                              </span>
                            </div>
                            <p className="text-muted-foreground text-sm mb-3">{mentor.user?.email}</p>

                            {/* Skills */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {(mentor.skills || []).slice(0, 5).map((skill, idx) => (
                                <span key={idx} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-sm rounded-full">
                                  {skill}
                                </span>
                              ))}
                            </div>

                            {/* Categories */}
                            {mentor.categories && mentor.categories.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {mentor.categories.map((cat, idx) => (
                                  <span key={idx} className="px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 text-sm rounded-full">
                                    {cat}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Bio */}
                            <p className="text-sm text-muted-foreground">
                              <strong>Bio:</strong> {mentor.bio?.substring(0, 100)}...
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons - Only show for pending mentors */}
                        {!mentor.isApproved && (
                          <div className="flex gap-3 pt-4 border-t border-border">
                            <Button
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleApproveMentor(mentor._id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve Mentor
                            </Button>
                            <Button
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                              onClick={() => handleRejectMentor(mentor._id)}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject Request
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'issues' && (
            <Card>
              <CardHeader>
                <CardTitle>Platform Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {issues.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No issues found</p>
                  ) : (
                    issues.map((issue) => (
                      <motion.div
                        key={issue._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-6 border border-border rounded-lg hover:shadow-md transition bg-card text-card-foreground"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-lg text-foreground">{issue.title}</h3>
                              <span className={`px-3 py-1 text-sm rounded-full ${issue.status === 'open'
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                  : issue.status === 'in_progress'
                                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                                    : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                }`}>
                                {issue.status?.replace('_', ' ').toUpperCase()}
                              </span>
                              <span className={`px-3 py-1 text-sm rounded-full ${issue.priority === 'high'
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                  : issue.priority === 'medium'
                                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                                }`}>
                                {issue.priority?.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-muted-foreground mb-2">{issue.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Type: {issue.type}</span>
                              <span>Role: {issue.role}</span>
                              {issue.createdAt && (
                                <span>Created: {new Date(issue.createdAt).toLocaleDateString()}</span>
                              )}
                              {issue.remark && (
                                <span className="text-primary-700 dark:text-primary-400 font-medium">Remark: {issue.remark}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 pt-3">
                          <Button
                            variant="outline"
                            onClick={() => updateIssueStatus(issue._id, 'in_progress')}
                            className="text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                          >
                            Mark In-Progress
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => updateIssueStatus(issue._id, 'closed')}
                            className="text-green-700 dark:text-green-400 border-green-300 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                          >
                            Close Issue
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => updateIssueRemark(issue._id)}
                            className="text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            Add Remark
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;