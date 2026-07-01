import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/ui/toaster';
import api from '../utils/api';

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = ({ d }) => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={d} />
  </svg>
);

const NAV_ITEMS = [
  { id: 'overview',    label: 'Overview',         icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',  perm: null },
  { id: 'users',       label: 'User Management',  icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', perm: 'canManageUsers' },
  { id: 'mentors',     label: 'Mentor Management',icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', perm: 'canManageMentors' },
  { id: 'categories',  label: 'Categories',       icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z', perm: null },
  { id: 'subadmins',   label: 'Sub Admin',        icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', perm: null, adminOnly: true },
];

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ user }) => {
  if (user.isBanned)    return <span className="px-2 py-0.5 text-xs font-medium bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400    rounded-full">Banned</span>;
  if (user.isSuspended) return <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">Suspended</span>;
  if (!user.isActive)   return <span className="px-2 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 rounded-full">Inactive</span>;
  return <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">Active</span>;
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, color = 'blue' }) => {
  const colors = {
    blue:   'from-blue-500 to-blue-600',
    green:  'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red:    'from-red-500 to-red-600',
  };
  return (
    <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-neutral-800 rounded-2xl p-5 shadow-sm border border-neutral-100 dark:border-neutral-700 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-md`}>
        <span className="text-white text-xl">{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-neutral-900 dark:text-white">{value ?? '—'}</p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
      </div>
    </motion.div>
  );
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeSection,   setActiveSection]   = useState('overview');
  const [sidebarOpen,     setSidebarOpen]      = useState(true);
  const [stats,           setStats]            = useState(null);
  const [users,           setUsers]            = useState([]);
  const [mentors,         setMentors]          = useState([]);
  const [categories,      setCategories]       = useState([]);
  const [subAdmins,       setSubAdmins]        = useState([]);
  const [loading,         setLoading]          = useState(false);
  const [userSearch,      setUserSearch]       = useState('');
  const [userFilter,      setUserFilter]       = useState('');
  const [userRoleFilter,  setUserRoleFilter]   = useState('');
  const [mentorFilter,    setMentorFilter]     = useState('');
  const [userPage,        setUserPage]         = useState(1);
  const [userTotal,       setUserTotal]        = useState(0);
  const [userTotalPages,  setUserTotalPages]   = useState(1);
  const [newCategory,     setNewCategory]      = useState({ name: '', description: '' });
  const [modalUser,       setModalUser]        = useState(null);   // user detail/status modal
  const [promoteModal,    setPromoteModal]     = useState(null);   // promote user to sub_admin
  const [permissions,     setPermissions]      = useState({ canManageUsers: false, canManageMentors: false, canViewReports: false, canModerateContent: false, canViewAnalytics: false });

  const isAdmin    = user?.role === 'admin';
  const isSubAdmin = user?.role === 'sub_admin';

  // ── Helper: can sub_admin see this section? ──────────────────────────────
  const canSee = (perm) => isAdmin || (isSubAdmin && (!perm || user?.permissions?.[perm]));

  // ── Fetch stats ──────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.data);
    } catch {}
  }, []);

  // ── Fetch users with pagination + search + filter ────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: userPage, limit: 20 });
      if (userSearch)     params.set('search', userSearch);
      if (userFilter)     params.set('status', userFilter);
      if (userRoleFilter) params.set('role',   userRoleFilter);
      const res = await api.get(`/admin/users?${params}`);
      setUsers(res.data.data);
      setUserTotal(res.data.total);
      setUserTotalPages(res.data.pages);
    } catch {
      toast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [userPage, userSearch, userFilter, userRoleFilter]);

  // ── Fetch mentors ─────────────────────────────────────────────────────────
  const fetchMentors = useCallback(async () => {
    setLoading(true);
    try {
      const params = mentorFilter ? `?status=${mentorFilter}` : '';
      const res = await api.get(`/admin/all-mentors${params}`);
      setMentors(res.data.data);
    } catch {} finally { setLoading(false); }
  }, [mentorFilter]);

  // ── Fetch categories ─────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/admin/categories');
      setCategories(res.data.data);
    } catch {}
  }, []);

  // ── Fetch sub admins ─────────────────────────────────────────────────────
  const fetchSubAdmins = useCallback(async () => {
    try {
      const res = await api.get('/permissions/sub-admins');
      setSubAdmins(res.data.data);
    } catch {}
  }, []);

  // ── Load data when section changes ───────────────────────────────────────
  useEffect(() => {
    if (activeSection === 'overview')   fetchStats();
    if (activeSection === 'users')      fetchUsers();
    if (activeSection === 'mentors')    fetchMentors();
    if (activeSection === 'categories') fetchCategories();
    if (activeSection === 'subadmins')  fetchSubAdmins();
  }, [activeSection, fetchUsers, fetchMentors]);

  useEffect(() => {
    if (activeSection === 'users') fetchUsers();
  }, [userPage, userSearch, userFilter, userRoleFilter]);

  // ── User actions ─────────────────────────────────────────────────────────
  const updateStatus = async (userId, body) => {
    try {
      await api.put(`/admin/user/${userId}/status`, body);
      toast('Status updated', 'success');
      fetchUsers();
    } catch { toast('Failed to update status', 'error'); }
  };

  const resetPassword = async (userId) => {
    if (!window.confirm('Send a temporary password to this user via email?')) return;
    try {
      await api.post(`/admin/user/${userId}/reset-password`);
      toast('Temporary password sent to user email', 'success');
    } catch { toast('Failed to reset password', 'error'); }
  };

  const changeRole = async (userId, role) => {
    try {
      await api.put(`/admin/user/${userId}/role`, { role });
      toast(`Role changed to ${role}`, 'success');
      fetchUsers();
    } catch { toast('Failed to change role', 'error'); }
  };

  // ── Mentor actions ───────────────────────────────────────────────────────
  const approveMentor = async (id) => {
    try {
      await api.put(`/admin/mentor/approve/${id}`);
      toast('Mentor approved!', 'success');
      fetchMentors();
    } catch { toast('Failed to approve mentor', 'error'); }
  };

  const toggleMentor = async (id) => {
    try {
      await api.put(`/admin/mentor/${id}/toggle`);
      toast('Mentor status toggled', 'success');
      fetchMentors();
    } catch { toast('Failed to toggle', 'error'); }
  };

  const rejectMentor = async (id) => {
    if (!window.confirm('Reject and permanently delete this mentor application?')) return;
    try {
      await api.put(`/admin/mentor/reject/${id}`);
      toast('Mentor rejected', 'success');
      fetchMentors();
    } catch { toast('Failed to reject mentor', 'error'); }
  };

  // ── Category actions ─────────────────────────────────────────────────────
  const createCategory = async () => {
    if (!newCategory.name.trim()) return;
    try {
      await api.post('/admin/categories', newCategory);
      toast('Category created!', 'success');
      setNewCategory({ name: '', description: '' });
      fetchCategories();
    } catch { toast('Failed to create category', 'error'); }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      toast('Category deleted', 'success');
      fetchCategories();
    } catch { toast('Failed to delete', 'error'); }
  };

  // ── Promote to sub_admin ─────────────────────────────────────────────────
  const promoteUser = async () => {
    if (!promoteModal) return;
    try {
      await api.post(`/permissions/promote/${promoteModal._id}`, permissions);
      toast(`${promoteModal.name} promoted to Sub Admin`, 'success');
      setPromoteModal(null);
      fetchSubAdmins();
    } catch { toast('Failed to promote user', 'error'); }
  };

  const revokeSubAdmin = async (userId, name) => {
    if (!window.confirm(`Revoke sub admin access for ${name}?`)) return;
    try {
      await api.delete(`/permissions/${userId}`);
      toast('Sub admin access revoked', 'success');
      fetchSubAdmins();
    } catch { toast('Failed to revoke', 'error'); }
  };

  // ── Find user for promote modal ──────────────────────────────────────────
  const openPromoteModal = async (email) => {
    if (!email) return;
    try {
      const res = await api.get('/admin/users', { params: { search: email, limit: 5 } });
      const found = res.data.data?.[0];
      if (!found) { toast('User not found', 'error'); return; }
      setPromoteModal(found);
      setPermissions({ canManageUsers: false, canManageMentors: false, canViewReports: false, canModerateContent: false, canViewAnalytics: false });
    } catch { toast('User not found', 'error'); }
  };

  const [promoteEmail, setPromoteEmail] = useState('');

  const navItems = NAV_ITEMS.filter(n => !n.adminOnly || isAdmin);

  return (
    <div className="min-h-screen flex bg-neutral-100 dark:bg-neutral-950 font-sans">

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} flex-shrink-0 transition-all duration-300 flex flex-col bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 shadow-sm`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-neutral-100 dark:border-neutral-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
          </div>
          {sidebarOpen && (
            <div>
              <p className="font-bold text-neutral-900 dark:text-white text-sm leading-none">MentorConnect</p>
              <p className="text-xs text-neutral-400 mt-0.5">Admin Panel</p>
            </div>
          )}
          <button onClick={() => setSidebarOpen(o => !o)} className="ml-auto text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? 'M11 19l-7-7 7-7m8 14l-7-7 7-7' : 'M13 5l7 7-7 7M5 5l7 7-7 7'}/></svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Icon d={item.icon} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-3 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden flex-1">
                <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-neutral-400 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            )}
          </div>
          <button onClick={logout} className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition mt-1 ${!sidebarOpen ? 'justify-center' : ''}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4 flex items-center justify-between shadow-sm">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white capitalize">
            {NAV_ITEMS.find(n => n.id === activeSection)?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${isAdmin ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
              {user?.role?.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

              {/* ════════════════════════════════════════════════════════════
                  OVERVIEW
              ════════════════════════════════════════════════════════════ */}
              {activeSection === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    <StatCard label="Total Users"       value={stats?.totalUsers}       icon="👥" color="blue" />
                    <StatCard label="Total Mentors"     value={stats?.totalMentors}      icon="🧑‍🏫" color="green" />
                    <StatCard label="Pending Mentors"   value={stats?.pendingMentors}    icon="⏳" color="orange" />
                    <StatCard label="Total Bookings"    value={stats?.totalBookings}     icon="📅" color="purple" />
                    <StatCard label="Open Issues"       value={stats?.openIssues}        icon="🐛" color="red" />
                  </div>
                </div>
              )}

              {/* ════════════════════════════════════════════════════════════
                  USER MANAGEMENT
              ════════════════════════════════════════════════════════════ */}
              {activeSection === 'users' && (
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="flex flex-wrap gap-3">
                    <input
                      value={userSearch}
                      onChange={e => { setUserSearch(e.target.value); setUserPage(1); }}
                      placeholder="Search by name or email…"
                      className="flex-1 min-w-48 px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select value={userFilter} onChange={e => { setUserFilter(e.target.value); setUserPage(1); }} className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none">
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="banned">Banned</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <select value={userRoleFilter} onChange={e => { setUserRoleFilter(e.target.value); setUserPage(1); }} className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none">
                      <option value="">All Roles</option>
                      <option value="mentee">Mentee</option>
                      <option value="mentor">Mentor</option>
                      <option value="sub_admin">Sub Admin</option>
                    </select>
                  </div>

                  {/* Table */}
                  <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-700">
                            {['User', 'Role', 'Status', 'Last Login', 'Actions'].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
                          {loading ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-400">Loading…</td></tr>
                          ) : users.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-400">No users found</td></tr>
                          ) : users.map(u => (
                            <tr key={u._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                    {u.avatar
                                      ? <img src={u.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                      : <span className="text-white text-xs font-bold">{u.name?.[0]?.toUpperCase()}</span>
                                    }
                                  </div>
                                  <div>
                                    <p className="font-medium text-neutral-900 dark:text-white">{u.name}</p>
                                    <p className="text-xs text-neutral-400">{u.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full capitalize">{u.role?.replace('_', ' ')}</span>
                              </td>
                              <td className="px-4 py-3"><StatusBadge user={u} /></td>
                              <td className="px-4 py-3 text-xs text-neutral-400">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : '—'}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1 flex-wrap">
                                  {/* Activate */}
                                  {(!u.isActive || u.isSuspended) && (
                                    <button onClick={() => updateStatus(u._id, { isActive: true, isSuspended: false, isBanned: false })} className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 transition">Activate</button>
                                  )}
                                  {/* Suspend */}
                                  {!u.isSuspended && !u.isBanned && (
                                    <button onClick={() => { const r = window.prompt('Reason for suspension?'); if (r !== null) updateStatus(u._id, { isSuspended: true, suspendedReason: r }); }} className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 transition">Suspend</button>
                                  )}
                                  {/* Ban */}
                                  {!u.isBanned && (
                                    <button onClick={() => { if (window.confirm('Ban this user permanently?')) updateStatus(u._id, { isBanned: true }); }} className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 transition">Ban</button>
                                  )}
                                  {/* Reset password */}
                                  <button onClick={() => resetPassword(u._id)} className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition">Reset Pwd</button>
                                  {/* Change role */}
                                  {isAdmin && u.role !== 'admin' && (
                                    <select value={u.role} onChange={e => changeRole(u._id, e.target.value)} className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-700 rounded-lg border-0 focus:outline-none">
                                      <option value="mentee">mentee</option>
                                      <option value="mentor">mentor</option>
                                      <option value="sub_admin">sub_admin</option>
                                    </select>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100 dark:border-neutral-700">
                      <span className="text-xs text-neutral-400">{userTotal} total users</span>
                      <div className="flex gap-2">
                        <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1} className="px-3 py-1 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-40 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition">Prev</button>
                        <span className="px-3 py-1 text-xs text-neutral-500">{userPage} / {userTotalPages}</span>
                        <button onClick={() => setUserPage(p => Math.min(userTotalPages, p + 1))} disabled={userPage >= userTotalPages} className="px-3 py-1 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-40 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition">Next</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ════════════════════════════════════════════════════════════
                  MENTOR MANAGEMENT
              ════════════════════════════════════════════════════════════ */}
              {activeSection === 'mentors' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    {['', 'pending', 'approved'].map(f => (
                      <button key={f} onClick={() => { setMentorFilter(f); fetchMentors(); }} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${mentorFilter === f ? 'bg-blue-600 text-white' : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700'}`}>
                        {f === '' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {loading ? (
                      <div className="col-span-full text-center py-12 text-neutral-400">Loading…</div>
                    ) : mentors.length === 0 ? (
                      <div className="col-span-full text-center py-12 text-neutral-400">No mentors found</div>
                    ) : mentors.map(m => (
                      <div key={m._id} className="bg-white dark:bg-neutral-800 rounded-2xl p-5 shadow-sm border border-neutral-100 dark:border-neutral-700">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                            {m.user?.avatar
                              ? <img src={m.user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                              : <span className="text-white text-sm font-bold">{m.user?.name?.[0]?.toUpperCase()}</span>
                            }
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-900 dark:text-white text-sm">{m.user?.name}</p>
                            <p className="text-xs text-neutral-400">{m.user?.email}</p>
                          </div>
                          <span className={`ml-auto px-2 py-0.5 text-xs font-medium rounded-full ${m.isApproved ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                            {m.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </div>

                        {m.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {m.skills.slice(0, 3).map(s => (
                              <span key={s} className="px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-full">{s}</span>
                            ))}
                            {m.skills.length > 3 && <span className="px-2 py-0.5 text-xs text-neutral-400">+{m.skills.length - 3} more</span>}
                          </div>
                        )}

                        <div className="flex gap-2 flex-wrap">
                          {!m.isApproved && (
                            <button onClick={() => approveMentor(m._id)} className="px-3 py-1.5 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg transition">Approve</button>
                          )}
                          <button onClick={() => toggleMentor(m._id)} className="px-3 py-1.5 text-xs font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg transition">
                            {m.isApproved ? 'Disable' : 'Enable'}
                          </button>
                          {!m.isApproved && (
                            <button onClick={() => rejectMentor(m._id)} className="px-3 py-1.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 rounded-lg transition">Reject</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ════════════════════════════════════════════════════════════
                  CATEGORIES
              ════════════════════════════════════════════════════════════ */}
              {activeSection === 'categories' && (
                <div className="space-y-4 max-w-2xl">
                  <div className="bg-white dark:bg-neutral-800 rounded-2xl p-5 shadow-sm border border-neutral-100 dark:border-neutral-700 space-y-3">
                    <h3 className="font-semibold text-neutral-900 dark:text-white">Add Category</h3>
                    <input value={newCategory.name} onChange={e => setNewCategory(c => ({...c, name: e.target.value}))} placeholder="Category name" className="w-full px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input value={newCategory.description} onChange={e => setNewCategory(c => ({...c, description: e.target.value}))} placeholder="Description (optional)" className="w-full px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button onClick={createCategory} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition">Create</button>
                  </div>

                  <div className="space-y-2">
                    {categories.map(cat => (
                      <div key={cat._id} className="flex items-center justify-between bg-white dark:bg-neutral-800 rounded-xl px-4 py-3 shadow-sm border border-neutral-100 dark:border-neutral-700">
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white text-sm">{cat.name}</p>
                          {cat.description && <p className="text-xs text-neutral-400">{cat.description}</p>}
                        </div>
                        <button onClick={() => deleteCategory(cat._id)} className="text-red-500 hover:text-red-700 transition">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ════════════════════════════════════════════════════════════
                  SUB ADMIN MANAGEMENT
              ════════════════════════════════════════════════════════════ */}
              {activeSection === 'subadmins' && isAdmin && (
                <div className="space-y-6 max-w-3xl">
                  {/* Promote */}
                  <div className="bg-white dark:bg-neutral-800 rounded-2xl p-5 shadow-sm border border-neutral-100 dark:border-neutral-700">
                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">Promote User to Sub Admin</h3>
                    <div className="flex gap-3">
                      <input value={promoteEmail} onChange={e => setPromoteEmail(e.target.value)} placeholder="Enter user email…" className="flex-1 px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <button onClick={() => openPromoteModal(promoteEmail)} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition">Find User</button>
                    </div>
                  </div>

                  {/* Promote modal */}
                  {promoteModal && (
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl p-5 shadow-sm border border-blue-200 dark:border-blue-800 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{promoteModal.name?.[0]?.toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">{promoteModal.name}</p>
                          <p className="text-xs text-neutral-400">{promoteModal.email}</p>
                        </div>
                      </div>

                      <h4 className="font-medium text-neutral-900 dark:text-white text-sm">Assign Permissions</h4>
                      <div className="space-y-2">
                        {Object.entries(permissions).map(([key, val]) => (
                          <label key={key} className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={val} onChange={e => setPermissions(p => ({...p, [key]: e.target.checked}))} className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500" />
                            <span className="text-sm text-neutral-700 dark:text-neutral-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          </label>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <button onClick={promoteUser} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition">Promote to Sub Admin</button>
                        <button onClick={() => setPromoteModal(null)} className="px-5 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-sm rounded-xl transition">Cancel</button>
                      </div>
                    </div>
                  )}

                  {/* Sub admins list */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-neutral-900 dark:text-white">Current Sub Admins</h3>
                    {subAdmins.length === 0 ? (
                      <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 text-center text-neutral-400 border border-neutral-100 dark:border-neutral-700">No sub admins yet</div>
                    ) : subAdmins.map(sa => (
                      <div key={sa._id} className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm border border-neutral-100 dark:border-neutral-700">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">{sa.name?.[0]?.toUpperCase()}</span>
                            </div>
                            <div>
                              <p className="font-medium text-neutral-900 dark:text-white text-sm">{sa.name}</p>
                              <p className="text-xs text-neutral-400">{sa.email}</p>
                            </div>
                          </div>
                          <button onClick={() => revokeSubAdmin(sa._id, sa.name)} className="px-3 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">Revoke</button>
                        </div>
                        {sa.permissions && (
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(sa.permissions)
                              .filter(([k, v]) => !['_id', 'user', 'grantedBy', 'grantedAt', 'createdAt', 'updatedAt', '__v'].includes(k) && v === true)
                              .map(([k]) => (
                                <span key={k} className="px-2 py-0.5 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full capitalize">
                                  {k.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                              ))
                            }
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;