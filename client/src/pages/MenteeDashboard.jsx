import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, TrendingUp, Users, Star, MessageSquare } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCall } from '../context/CallContext';
import { toast } from '../components/ui/toaster';

const MenteeDashboard = () => {
  const { user } = useAuth();
  const { setActiveCall, setCallStatus } = useCall();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    upcomingSessions: 0,
    completedSessions: 0,
    activeMentors: 0,
    averageRating: 4.9,
  });
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
      fetchIssues();
    }
  }, [user]);

  const fetchIssues = async () => {
    try {
      const res = await api.get('/issues');
      setIssues(res.data.data || []);
    } catch (error) {
      console.error('Fetch issues error', error);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!confirm('Are you sure you want to cancel? This will remove the booking.')) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      // Remove from local state immediately
      setBookings(prev => prev.filter(b => b._id !== id));
      toast('Booking cancelled and removed', 'info');
    } catch (error) {
      console.error('Cancel error', error);
      toast('Failed to cancel booking', 'error');
    }
  };

  const fetchBookings = async () => {
    if (!user) return;
    try {
      const userId = user._id || user.id;
      const response = await api.get(`/bookings/user/${userId}`);
      const allBookings = response.data.data || [];
      setBookings(allBookings);

      // Calculate stats
      const upcoming = allBookings.filter(b => {
        if (b.status !== 'confirmed') return false;
        const end = getDateTime(b.sessionDate, b.sessionTime?.end);
        return end && end > new Date();
      }).length;

      const completed = allBookings.filter(b => b.status === 'completed').length;
      const activeMentors = new Set(allBookings.map(b => b.mentor?._id)).size;

      setStats({
        upcomingSessions: upcoming,
        completedSessions: completed,
        activeMentors: activeMentors,
        averageRating: 4.9,
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    const date = new Date(dateStr);
    const [hours, minutes] = timeStr.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const upcomingBookings = bookings.filter(b => {
    if (b.status === 'cancelled') return false;
    // If completed, not upcoming
    if (b.status === 'completed') return false;

    // Check if time has passed
    const end = getDateTime(b.sessionDate, b.sessionTime?.end);
    // It is upcoming if end time is in future OR if it is pending (regardless of time, until rejected)
    // Actually strictly upcoming usually means verified future. 
    // User said "if time exceeds... should not able to chat". 
    // Use end time for expiry.
    if (b.status === 'pending') return true;
  });

  const handleJoinCall = async (booking) => {
    try {
      const res = await api.get(`/bookings/${booking._id}/active-call`);
      const activeSession = res.data.data;
      if (activeSession) {
        // Redirect to call page as callee using the retrieved roomId
        setActiveCall({
          roomId: activeSession.roomId,
          peerId: activeSession.caller._id || activeSession.caller,
          peerName: activeSession.caller.name,
          role: 'callee',
          offer: activeSession.offer || null,
        });
        setCallStatus('connecting');
        navigate(`/call/${activeSession.roomId}`);
      } else {
        // Fallback to meeting link if no active session yet
        if (booking.meetingLink) {
          window.open(booking.meetingLink, '_blank', 'noopener');
        } else {
          toast('Mentor has not started the video call yet. Wait for a call notification or try again.', 'info');
        }
      }
    } catch (err) {
      toast('Failed to join call', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col ">
      <Navbar />

      <div className="flex-1 bg-background text-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Welcome back, {user?.name?.split(' ')[0] || 'Entrepreneur'}!
                </h1>
                <p className="text-neutral-600">Manage your mentorship sessions and track your progress</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/mentee/messages')}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </Button>
                <Link to="/mentors">
                  <Button className="bg-primary-600">Browse Mentors</Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">Upcoming Sessions</p>
                      <p className="text-3xl font-bold">{stats.upcomingSessions}</p>
                    </div>
                    <Calendar className="h-10 w-10 text-blue-600 bg-blue-100 p-2 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">Completed Sessions</p>
                      <p className="text-3xl font-bold">{stats.completedSessions}</p>
                    </div>
                    <TrendingUp className="h-10 w-10 text-green-600 bg-green-100 p-2 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">Active Mentors</p>
                      <p className="text-3xl font-bold">{stats.activeMentors}</p>
                    </div>
                    <Users className="h-10 w-10 text-purple-600 bg-purple-100 p-2 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">Average Rating</p>
                      <p className="text-3xl font-bold">{stats.averageRating}</p>
                    </div>
                    <Star className="h-10 w-10 text-yellow-600 bg-yellow-100 p-2 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Upcoming Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Calendar className="mr-2" />
                      Upcoming Sessions
                    </CardTitle>
                    <Link to="/mentors" className="text-primary-600 text-sm hover:underline">
                      Book New Session
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {upcomingBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                      <p className="text-neutral-600 mb-4">No upcoming sessions</p>
                      <Link to="/mentors">
                        <Button className="bg-primary-600">Find a Mentor</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingBookings.slice(0, 5).map((booking) => {
                        const sessionEnd = getDateTime(booking.sessionDate, booking.sessionTime?.end);
                        const canChat = booking.mentor?.user?._id && (booking.status === 'confirmed' || booking.status === 'completed') && (!sessionEnd || sessionEnd > new Date());
                        return (
                          <motion.div
                            key={booking._id}
                            whileHover={{ x: 4 }}
                            className="p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-neutral-50 transition"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="font-semibold text-neutral-900">
                                  {booking.topic || 'Mentoring Session'}
                                </p>
                                <p className="text-sm text-neutral-600 mt-1">
                                  with {booking.mentor?.user?.name}
                                </p>
                              </div>
                              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                Upcoming
                              </span>
                            </div>
                            <p className="text-sm text-neutral-600 mb-3">
                              📅 {new Date(booking.sessionDate).toLocaleDateString()} at {booking.sessionTime?.start || 'TBD'}
                            </p>
                            <div className="flex gap-3">
                              <Button
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                onClick={() => handleJoinCall(booking)}
                              >
                                Join Call
                              </Button>
                              {canChat && (
                                <Button
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => navigate(`/mentee/messages?mentor=${booking.mentor.user._id}`)}
                                >
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  Chat
                                </Button>
                              )}
                              {booking.status === 'pending' && (
                                <Button
                                  variant="destructive"
                                  className="flex-1"
                                  onClick={() => handleCancelBooking(booking._id)}
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-6">
                    <Link to="/mentors">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                        Find a Mentor
                      </Button>
                    </Link>
                    <Link to="/resources">
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                        View Resources
                      </Button>
                    </Link>
                    <Link to="/goals">
                      <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                        Track Goals
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Chat with Mentors - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2" />
                  Chat with Mentors
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const mentorsMap = new Map();
                  const now = new Date();
                  bookings.forEach((booking) => {
                    if (booking.mentor?.user && !mentorsMap.has(booking.mentor.user._id)) {
                      const sessionEnd = getDateTime(booking.sessionDate, booking.sessionTime?.end);
                      // Only confirmed/completed sessions that haven't expired allow chat
                      if ((booking.status === 'confirmed' || booking.status === 'completed') && (!sessionEnd || sessionEnd > now)) {
                        mentorsMap.set(booking.mentor.user._id, booking.mentor.user);
                      }
                    }
                  });
                  const uniqueMentors = Array.from(mentorsMap.values());

                  if (uniqueMentors.length === 0) {
                    return (
                      <p className="text-neutral-500 text-center py-8">
                        No mentors yet. Book a session to start chatting.
                      </p>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {uniqueMentors.slice(0, 5).map((mentor) => (
                        <motion.div
                          key={mentor._id}
                          whileHover={{ x: 4 }}
                          className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-neutral-50 transition"
                        >
                          <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {mentor.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{mentor.name}</p>
                            <p className="text-xs text-neutral-600">{mentor.email}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/mentee/messages?mentor=${mentor._id}`)}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Chat
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </motion.div>

          {/* My Issues - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.68 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2" />
                    My Issues
                  </CardTitle>
                  <Link to="/report-issue">
                    <Button size="sm" variant="outline">Report Issue</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {issues.length === 0 ? (
                  <p className="text-neutral-500 text-center py-8">No issues reported</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {issues.map(issue => (
                      <div key={issue._id} className="p-4 border rounded-lg flex flex-col justify-between text-sm h-full hover:bg-neutral-50 transition">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-semibold text-base">{issue.title}</p>
                            <span className={`px-2 py-1 rounded text-xs capitalize ${issue.status === 'closed' ? 'bg-green-100 text-green-800' :
                              issue.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                              {issue.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-neutral-600 line-clamp-2">{issue.description || 'No description provided.'}</p>
                        </div>
                        <p className="text-xs text-neutral-500 mt-4 pt-2 border-t">{new Date(issue.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* All Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>All Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <p className="bg-background text-foreground text-center py-8">No sessions booked yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className=" text-foreground border-b">
                        <tr>
                          <th className="text-left p-3 font-semibold text-sm">Mentor</th>
                          <th className="text-left p-3 font-semibold text-sm">Date & Time</th>
                          <th className="text-left p-3 font-semibold text-sm">Topic</th>
                          <th className="text-left p-3 font-semibold text-sm">Status</th>
                          <th className="text-left p-3 font-semibold text-sm">Amount</th>
                          <th className="text-left p-3 font-semibold text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => (
                          <tr key={booking._id} className="border-b hover:bg-neutral-50 transition">
                            <td className="p-3 text-sm">{booking.mentor?.user?.name}</td>
                            <td className="p-3 text-sm">
                              {new Date(booking.sessionDate).toLocaleDateString()} at {booking.sessionTime?.start || 'TBD'}
                            </td>
                            <td className="p-3 text-sm text-neutral-600">{booking.topic || '-'}</td>
                            <td className="p-3 text-sm">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                  booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-neutral-100 text-neutral-800'
                                }`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="p-3 text-sm font-semibold">${booking.amount || '0'}</td>
                            <td className="p-3 text-sm">
                              {booking.mentor?.user?._id && (booking.status === 'confirmed' || booking.status === 'completed') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/mentee/messages?mentor=${booking.mentor.user._id}`)}
                                >
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  Chat
                                </Button>
                              )}
                              {booking.status === 'pending' && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleCancelBooking(booking._id)}
                                >
                                  Cancel
                                </Button>
                              )}
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div >

      <Footer />
    </div >
  );
};

export default MenteeDashboard;

