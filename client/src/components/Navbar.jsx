import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Menu, X, User, LogOut, LayoutDashboard, ChevronDown, AlertTriangle, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleLogout = async () => {
    await logout();
  };

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'mentor') return '/mentor/dashboard';
    return '/mentee/dashboard';
  };

  return (
    <nav className="bg-white dark:bg-neutral-900 shadow-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center cursor-pointer transition-transform hover:scale-105">
            <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">MentorConnect</h1>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {!user && (
              <Link to="/" className="text-neutral-700 dark:text-neutral-100 hover:text-primary-500 dark:hover:text-primary-300 transition">
                Home
              </Link>
            )}
            {(!user || user.role === 'mentee') && (
              <Link to="/mentors" className="text-neutral-700 dark:text-neutral-100 hover:text-primary-500 dark:hover:text-primary-300 transition">
                Find Mentors
              </Link>
            )}

            {user ? (
              <>
                {getDashboardLink() && (
                  <Link to={getDashboardLink()}>
                    <Button variant="ghost" size="sm" className="text-neutral-800 dark:text-neutral-100 hover:text-primary-600 dark:hover:text-primary-300">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                )}

                {user.role === 'mentor' && !user.mentorProfile && (
                  <Link to="/mentor/apply">
                    <Button variant="outline" size="sm">
                      Become a Mentor
                    </Button>
                  </Link>
                )}
                <div className="relative group">
                  <button className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
                    <User className="h-5 w-5 text-neutral-600 dark:text-neutral-200" />
                    <span className="text-sm text-neutral-700 dark:text-neutral-100">{user.name}</span>
                    <ChevronDown className="h-4 w-4 text-neutral-600 dark:text-neutral-200" />
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-0 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <Link to="/profile/edit" className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-t-lg">
                      Edit Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-b-lg border-t dark:border-neutral-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/select-role">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
            <button
              onClick={() => setIsDark((v) => !v)}
              className="ml-2 p-2 rounded-full border border-neutral-200 hover:border-primary-400 hover:bg-neutral-100 text-neutral-700 dark:text-neutral-200 dark:border-neutral-700 dark:hover:border-primary-400 transition"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t"
          >
            <div className="px-4 py-4 space-y-3">
              {!user && (
                <Link
                  to="/"
                  className="block text-neutral-700 hover:text-primary-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
              )}
              {(!user || user.role === 'mentee') && (
                <Link
                  to="/mentors"
                  className="block text-neutral-700 dark:text-neutral-200 hover:text-primary-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Find Mentors
                </Link>
              )}
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 w-full justify-start"
                onClick={() => {
                  setIsDark((v) => !v);
                }}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span className="text-sm">{isDark ? 'Light' : 'Dark'} Mode</span>
              </Button>
              {user ? (
                <>
                  {getDashboardLink() && (
                    <Link
                      to={getDashboardLink()}
                      className="block"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                  )}

                  <div className="flex items-center space-x-2 py-2">
                    <User className="h-5 w-5 text-neutral-600" />
                    <span className="text-sm text-neutral-700">{user.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/select-role" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full text-slate-900">
                      Admin Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="sm" className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

