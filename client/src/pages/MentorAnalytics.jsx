import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const MentorAnalytics = () => {
  const location = useLocation();
  const stats = location.state?.stats || {
    totalBookings: 0,
    upcomingSessions: 0,
    completedSessions: 0,
    activeMentees: 0,
    totalEarnings: 0,
    averageRating: 0,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-neutral-50 dark:bg-background py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Stat label="Total Bookings" value={stats.totalBookings} />
              <Stat label="Upcoming Sessions" value={stats.upcomingSessions} />
              <Stat label="Completed Sessions" value={stats.completedSessions} />
              <Stat label="Active Mentees" value={stats.activeMentees} />
              <Stat label="Total Earnings" value={`$${stats.totalEarnings || 0}`} />
              <Stat label="Average Rating" value={stats.averageRating} />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-card">
    <p className="text-sm text-neutral-600 dark:text-neutral-300">{label}</p>
    <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">{value}</p>
  </div>
);

export default MentorAnalytics;
