import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, Users, MessageSquare, TrendingUp, DollarSign } from 'lucide-react';
import api from '../utils/api';
import logger from '../utils/logger';
import { useAuth } from '../context/AuthContext';
import { useCall } from '../context/CallContext';
import { toast } from '../components/ui/toaster';

const MentorDashboard = () => {
  const { user } = useAuth();
  const { startCall } = useCall();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [mentorProfileData, setMentorProfileData] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingSessions: 0,
    totalEarnings: 0,
    completedSessions: 0,
    activeMentees: 0,
    averageRating: 4.9,
  });
  const [loading, setLoading] = useState(true);
  const earningsRef = useRef(null);

  // Check if mentorProfile is populated or just an ID
  const mentorProfileId = user?.mentorProfile?._id || user?.mentorProfile;
  const mentorProfile = mentorProfileData || (user?.mentorProfile?.isApproved !== undefined ? user?.mentorProfile : null);

  const isPending = mentorProfileId && mentorProfile && mentorProfile.isApproved === false;

  const getMentorProfileId = (profile) =>
    typeof profile === 'string' ? profile : profile?._id;

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
      const effectiveUser = user || storedUser;
      const currentMentorProfile = effectiveUser?.mentorProfile;
      const profileId = getMentorProfileId(currentMentorProfile) || effectiveUser?._id || effectiveUser?.id;

      try {
        const hasFullProfile =
          currentMentorProfile &&
          typeof currentMentorProfile === 'object' &&
          'isApproved' in currentMentorProfile;

        if (hasFullProfile) {
          if (currentMentorProfile.isApproved && profileId) {
            await fetchBookings(profileId);
          } else {
            isMounted && setLoading(false);
          }
          return;
        }

        if (profileId) {
          const response = await api.get(`/mentors/${profileId}`);
          if (!isMounted) return;

          const mentorData = response.data.data;
          setMentorProfileData(mentorData);

          if (mentorData?.isApproved) {
            await fetchBookings(profileId);
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        logger.error('Error loading mentor data', error);
        isMounted && setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const fetchBookings = async (mentorProfileId) => {
    try {
      const response = await api.get(`/bookings/mentor/${mentorProfileId}`);
      if (isMountedRef.current) {
        setBookings(response.data.data);
        const upcoming = response.data.data.filter(
          b => new Date(b.sessionDate) > new Date() && b.status === 'confirmed'
        ).length;
        const completed = response.data.data.filter(b => b.status === 'completed').length;
        const activeMentees = new Set(response.data.data.map(b => b.mentee?._id)).size;

        setStats({
          totalBookings: response.data.data.length,
          upcomingSessions: upcoming,
          completedSessions: completed,
          activeMentees: activeMentees,
          totalEarnings: response.data.data
            .filter(b => b.status === 'completed') // User wants earnings from bookings they *gave* (completed)
            .reduce((sum, b) => sum + (Number(b.amount) || 0), 0),
          averageRating: 4.9,
        });
      }
    } catch (error) {
      logger.error('Error fetching bookings', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  // Quick action handlers
  const [actionLoading, setActionLoading] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const [availability, setAvailability] = useState({
    monday: [{ start: '09:00', end: '17:00' }],
    tuesday: [{ start: '09:00', end: '17:00' }],
    wednesday: [{ start: '09:00', end: '17:00' }],
    thursday: [{ start: '09:00', end: '17:00' }],
    friday: [{ start: '09:00', end: '17:00' }],
    saturday: [],
    sunday: [],
  });
  const [editingAvailability, setEditingAvailability] = useState(false);

  useEffect(() => {
    if (mentorProfileData?.availability) {
      setAvailability(mentorProfileData.availability);
    }
  }, [mentorProfileData]);

  const handleApproveBooking = async (bookingId) => {
    try {
      await api.put(`/bookings/${bookingId}/approve`);
      toast('Booking approved', 'success');
      fetchBookings(mentorProfileId);
    } catch (error) {
      toast('Failed to approve booking', 'error');
    }
  };

  const handleRejectBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to reject this booking?')) return;
    try {
      await api.put(`/bookings/${bookingId}/reject`);
      toast('Booking rejected', 'info');
      fetchBookings(mentorProfileId);
    } catch (error) {
      toast('Failed to reject booking', 'error');
    }
  };

  const saveAvailability = async () => {
    try {
      setActionLoading(true);
      await api.put(`/mentors/${mentorProfileId}`, { availability });
      toast('Availability updated', 'success');
      setEditingAvailability(false);
      // Update local profile data
      if (mentorProfileData) {
        setMentorProfileData({ ...mentorProfileData, availability });
      }
    } catch (error) {
      toast('Failed to update availability', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAvailabilityChange = (day, field, value) => {
    setAvailability(prev => {
      const newDay = [...(prev[day] || [])];
      if (newDay.length === 0) newDay.push({ start: '09:00', end: '17:00' });

      newDay[0] = { ...newDay[0], [field]: value };
      return { ...prev, [day]: newDay };
    });
  };

  const toggleDayAvailability = (day) => {
    setAvailability(prev => {
      const isEnabled = prev[day] && prev[day].length > 0;
      return {
        ...prev,
        [day]: isEnabled ? [] : [{ start: '09:00', end: '17:00' }]
      };
    });
  };


  const handleShareResources = async () => {
    if (!mentorProfileId) return toast('Mentor profile missing', 'error');
    const url = window.prompt('Resource link (https://...)');
    if (!url) return;
    const title = window.prompt('Resource title');
    if (title === null) return;
    setActionLoading(true);

    try {
      // Create new resource object
      const newResource = { title: title || 'Resource', url };

      // Get existing resources from state or default to empty array
      const existingResources = mentorProfile?.resources || [];

      await api.put(`/mentors/${mentorProfileId}`, {
        resources: [...existingResources, newResource],
      });

      // Update local state to reflect change immediately (optional but good UX)
      if (mentorProfileData) {
        setMentorProfileData({
          ...mentorProfileData,
          resources: [...existingResources, newResource]
        });
      }

      toast('Resource saved', 'success');
    } catch (error) {
      logger.error('Error saving resource', error);
      toast(error.response?.data?.message || 'Failed to save resource', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewAnalytics = () => {
    // Use existing stats as computed from DB bookings; send to analytics page if exists
    navigate('/mentor/analytics', { state: { stats } });
  };

  const handleMessages = () => {
    navigate('/mentor/messages');
  };

  const goToEarnings = () => {
    navigate('/mentor/earnings', { state: { stats } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // New mentor (no profile yet)
  if (!mentorProfile) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md bg-card text-card-foreground border-border">
            <CardHeader>
              <CardTitle>Become a Mentor</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">You need to apply as a mentor first.</p>
              <Link to="/mentor/apply">
                <Button>Apply Now</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Pending approval view
  if (isPending) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md bg-card text-card-foreground border-border">
            <CardHeader>
              <CardTitle>Application Pending</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">Your mentor application is pending admin approval. We’ll notify you once reviewed.</p>
              <div className="flex gap-3">
                <Link to="/mentor/apply">
                  <Button variant="outline">Edit Application</Button>
                </Link>
                <Button variant="default">Raise Request</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AvailabilityEditor
        isOpen={editingAvailability}
        onClose={() => setEditingAvailability(false)}
        availability={availability}
        onToggleDay={toggleDayAvailability}
        onChange={handleAvailabilityChange}
        onSave={saveAvailability}
        loading={actionLoading}
      />
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
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Welcome back, {user?.name?.split(' ')[0] || 'Mentor'}!
                </h1>
                <p className="text-muted-foreground">View your upcoming sessions, earnings and manage your mentees</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/mentor/messages')}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToEarnings}
                  className="flex items-center gap-2"
                >
                  <DollarSign className="h-4 w-4" />
                  Earnings
                </Button>
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
              <Card className="bg-card text-card-foreground border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Upcoming Sessions</p>
                      <p className="text-3xl font-bold text-foreground">{stats.upcomingSessions}</p>
                    </div>
                    <Calendar className="h-10 w-10 text-blue-600 bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-card text-card-foreground border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                      <p className="text-3xl font-bold text-foreground">
                        ${stats.totalEarnings.toFixed(2)}
                      </p>
                    </div>
                    <TrendingUp className="h-10 w-10 text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="bg-card text-card-foreground border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Completed Sessions</p>
                      <p className="text-3xl font-bold text-foreground">{stats.completedSessions}</p>
                    </div>
                    <TrendingUp className="h-10 w-10 text-green-600 bg-green-100 dark:bg-green-900/30 p-2 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-card text-card-foreground border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Active Mentees</p>
                      <p className="text-3xl font-bold text-foreground">{stats.activeMentees}</p>
                    </div>
                    <Users className="h-10 w-10 text-purple-600 bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Removed average rating card as requested */}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2 space-y-6"
            >
              <Card className="bg-card text-card-foreground border-border">
                <CardHeader>
                  <CardTitle className="flex items-center text-foreground">
                    <Calendar className="mr-2" />
                    Upcoming Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bookings.filter(b => b.status === 'confirmed' && new Date(b.sessionDate) > new Date()).length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No upcoming sessions</p>
                  ) : (
                    <div className="space-y-4">
                      {bookings
                        .filter(b => b.status === 'confirmed' && new Date(b.sessionDate) > new Date())
                        .slice(0, 5)
                        .map((booking) => (
                          <motion.div
                            key={booking._id}
                            whileHover={{ x: 4 }}
                            className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary-300 dark:hover:border-primary-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition"
                          >
                            <div className="flex-1">
                              <p className="font-semibold text-foreground">{booking.mentee?.name}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                📅 {new Date(booking.sessionDate).toLocaleDateString()} at {booking.sessionTime?.start || 'TBD'}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">{booking.topic || 'General Session'}</p>
                            </div>
                             <div className="flex items-center gap-2 ml-4">
                              <Button
                                size="sm"
                                onClick={() => {
                                  if (booking.meetingLink) {
                                    window.open(booking.meetingLink, '_blank', 'noopener');
                                  } else {
                                    toast('Meeting link not set by admin yet', 'error');
                                  }
                                }}
                              >
                                Join Call
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-neutral-800"
                                onClick={() => {
                                  if (booking.mentee?._id) {
                                    startCall(booking.mentee._id, booking.mentee.name, booking._id);
                                  } else {
                                    toast('Mentee information is missing', 'error');
                                  }
                                }}
                              >
                                Start Video Call
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>


              {/* Pending Requests */}
              <Card className="bg-card text-card-foreground border-border">
                <CardHeader>
                  <CardTitle className="flex items-center text-foreground">
                    <Users className="mr-2" />
                    Pending Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bookings.filter(b => b.status === 'pending').length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No pending requests</p>
                  ) : (
                    <div className="space-y-4">
                      {bookings
                        .filter(b => b.status === 'pending')
                        .map((booking) => (
                          <motion.div
                            key={booking._id}
                            className="flex items-center justify-between p-4 border border-border rounded-lg bg-yellow-50 dark:bg-yellow-900/10"
                          >
                            <div className="flex-1">
                              <p className="font-semibold text-foreground">{booking.mentee?.name}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                📅 {new Date(booking.sessionDate).toLocaleDateString()} at {booking.sessionTime?.start}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">Topic: {booking.notes || 'No notes'}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleApproveBooking(booking._id)} className="bg-green-600 hover:bg-green-700">Approve</Button>
                              <Button size="sm" variant="destructive" onClick={() => handleRejectBooking(booking._id)}>Reject</Button>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              {/* Chat with Entrepreneurs */}
              <Card className="bg-card text-card-foreground border-border">
                <CardHeader>
                  <CardTitle className="flex items-center text-foreground">
                    <MessageSquare className="mr-2" />
                    Chat with Entrepreneurs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    // Get unique mentees from bookings
                    const menteesMap = new Map();
                    bookings.forEach(booking => {
                      if (booking.mentee && !menteesMap.has(booking.mentee._id)) {
                        // Only allow chat if confirmed or completed
                        const hasApprovedBooking = bookings.some(b =>
                          b.mentee?._id === booking.mentee._id &&
                          (b.status === 'confirmed' || b.status === 'completed')
                        );
                        if (hasApprovedBooking) {
                          menteesMap.set(booking.mentee._id, booking.mentee);
                        }
                      }
                    });
                    const uniqueMentees = Array.from(menteesMap.values());

                    if (uniqueMentees.length === 0) {
                      return <p className="text-muted-foreground text-center py-8">No active conversations yet</p>;
                    }

                    return (
                      <div className="space-y-3">
                        {uniqueMentees.slice(0, 5).map((mentee) => (
                          <motion.div
                            key={mentee._id}
                            whileHover={{ x: 4 }}
                            className="flex items-center gap-3 p-3 border border-border rounded-lg hover:border-primary-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition cursor-pointer"
                          >
                            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-neutral-900 flex items-center justify-center">
                              {mentee.avatar ? (
                                <img src={mentee.avatar} alt={mentee.name} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <span className="text-primary-600 dark:text-neutral-100 font-semibold">
                                  {mentee.name?.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-foreground">{mentee.name}</p>
                              <p className="text-sm text-muted-foreground">{mentee.email}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (mentee?._id) {
                                    navigate(`/mentor/messages?mentee=${mentee._id}`);
                                  } else {
                                    toast('Mentee not found for chat', 'error');
                                  }
                                }}
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Chat
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-neutral-800"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (mentee?._id) {
                                    startCall(mentee._id, mentee.name);
                                  } else {
                                    toast('Mentee information is missing', 'error');
                                  }
                                }}
                                title="Start Video Call"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-card text-card-foreground border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => setEditingAvailability(true)}
                    disabled={actionLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                  >
                    Manage Availability
                  </Button>
                  <Button
                    onClick={handleShareResources}
                    variant="outline"
                    disabled={actionLoading}
                    className="w-full"
                  >
                    Share Resources
                  </Button>
                  <Button
                    onClick={handleViewAnalytics}
                    variant="outline"
                    className="w-full"
                  >
                    View Analytics
                  </Button>
                  <Button
                    onClick={handleMessages}
                    variant="outline"
                    className="w-full"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div >
  );
};

function AvailabilityEditor({ isOpen, onClose, availability, onToggleDay, onChange, onSave, loading }) {
  if (!isOpen) return null;
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl bg-white dark:bg-neutral-900 border-border max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Manage Availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {days.map(day => {
            const isEnabled = availability[day] && availability[day].length > 0;
            const slot = isEnabled ? availability[day][0] : { start: '09:00', end: '17:00' };

            return (
              <div key={day} className="flex items-center gap-4 p-2 border-b border-border last:border-0">
                <div className="w-24 font-medium capitalize flex items-center gap-2">
                  <input type="checkbox" checked={isEnabled} onChange={() => onToggleDay(day)} />
                  {day}
                </div>
                {isEnabled && (
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <label className="text-xs text-muted-foreground">Start</label>
                      <input
                        type="time"
                        value={slot.start}
                        onChange={(e) => onChange(day, 'start', e.target.value)}
                        className="border rounded p-1 text-sm bg-transparent"
                      />
                    </div>
                    <span>-</span>
                    <div className="flex flex-col">
                      <label className="text-xs text-muted-foreground">End</label>
                      <input
                        type="time"
                        value={slot.end}
                        onChange={(e) => onChange(day, 'end', e.target.value)}
                        className="border rounded p-1 text-sm bg-transparent"
                      />
                    </div>
                  </div>
                )}
                {!isEnabled && <span className="text-sm text-muted-foreground italic">Unavailable</span>}
              </div>
            );
          })}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={onSave} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default MentorDashboard;

