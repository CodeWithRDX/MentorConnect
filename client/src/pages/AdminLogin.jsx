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
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      const userData = result.data.user || result.data;
      
      // Check if user is admin
      if (userData.role !== 'admin') {
        toast('Only admins can access this portal', 'error');
        setLoading(false);
        return;
      }
      
      toast('Admin login successful!', 'success');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast(error.response?.data?.message || 'Login failed', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <div className="flex-1 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <Shield className="h-8 w-8 text-slate-900" />
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
                  Admin Portal
                </h1>
              </div>
              <p className="text-lg text-gray-600 mb-8">
                Sign in to your admin account to manage the MentorConnect platform, approve mentors, handle issues, and view analytics.
              </p>
              
              {/* Login Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg p-8 border border-gray-100"
              >
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Admin Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="h-12 border-gray-300 focus:border-slate-500 focus:ring-slate-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="h-12 border-gray-300 focus:border-slate-500 focus:ring-slate-500"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                  
                  <div className="text-center text-sm text-gray-600 pt-2">
                    Not an admin?{' '}
                    <Link to="/select-role" className="text-slate-900 hover:text-slate-700 font-semibold">
                      Back to role selection
                    </Link>
                  </div>
                </form>
              </motion.div>
            </motion.div>

            {/* Right Image/Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">Admin Features</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold">✓</span>
                    </div>
                    <div>
                      <p className="font-semibold">User Management</p>
                      <p className="text-sm text-slate-300">View and manage all registered users</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold">✓</span>
                    </div>
                    <div>
                      <p className="font-semibold">Mentor Approval</p>
                      <p className="text-sm text-slate-300">Review and approve mentor requests</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold">✓</span>
                    </div>
                    <div>
                      <p className="font-semibold">Database Viewer</p>
                      <p className="text-sm text-slate-300">Browse and manage all database records</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold">✓</span>
                    </div>
                    <div>
                      <p className="font-semibold">Issue Management</p>
                      <p className="text-sm text-slate-300">Handle user complaints and issues</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold">✓</span>
                    </div>
                    <div>
                      <p className="font-semibold">Analytics</p>
                      <p className="text-sm text-slate-300">View platform statistics and insights</p>
                    </div>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminLogin;
