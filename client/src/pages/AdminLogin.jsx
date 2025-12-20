import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { toast } from '../components/ui/toaster';
import { motion } from 'framer-motion';
import { ArrowRight, Shield } from 'lucide-react';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await adminLogin(formData.email, formData.password);

      const userData = res.data?.user;

      if (!userData) {
        setError('Invalid response from server');
        toast('Invalid response from server', 'error');
        setLoading(false);
        return;
      }

      if (userData.role !== 'admin') {
        setError('Access Denied: Only admins can access this portal');
        toast('Only admins can access this portal', 'error');
        // Clear any tokens
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setLoading(false);
        return;
      }

      toast('Admin login successful!', 'success');
      navigate('/admin/dashboard');

    } catch (error) {
      console.error('Admin login error:', error);
      const errorMsg = error.response?.data?.message || 'Login failed';
      setError(errorMsg);
      toast(errorMsg, 'error');
      // Clear tokens on error
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <div className="flex-1 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <Shield className="h-8 w-8 text-slate-900 dark:text-slate-100" />
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
                  Admin Portal
                </h1>
              </div>
              <p className="text-lg text-muted-foreground mb-8">
                Sign in to manage the MentorConnect platform.
              </p>

              {/* Login Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-card text-card-foreground rounded-xl shadow-lg p-8 border border-border"
              >
                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Admin Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-600 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    {loading ? "Signing in..." : <>Sign In <ArrowRight className="h-5 w-5" /></>}
                  </button>

                  <div className="text-center text-sm text-muted-foreground pt-2">
                    Not an admin?{' '}
                    <Link to="/select-role" className="text-foreground font-semibold hover:underline">
                      Back to role selection
                    </Link>
                  </div>
                </form>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminLogin;