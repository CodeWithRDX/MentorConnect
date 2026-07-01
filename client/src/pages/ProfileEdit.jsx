import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/ui/toaster';
import api from '../utils/api';
import { User, Mail, Link2, Bell, Lock, Save, Globe, Linkedin, Twitter, Check } from 'lucide-react';

const TABS = [
  { id: 'general',     label: 'General',     icon: User },
  { id: 'social',      label: 'Social Links', icon: Link2 },
  { id: 'preferences', label: 'Preferences', icon: Bell },
  { id: 'security',    label: 'Security',    icon: Lock },
];

const TIMEZONES = [
  'UTC', 'Asia/Kolkata', 'America/New_York', 'America/Los_Angeles', 'America/Chicago',
  'Europe/London', 'Europe/Berlin', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Singapore',
  'Australia/Sydney', 'Pacific/Auckland',
];

const Toggle = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${checked ? 'bg-blue-600' : 'bg-neutral-200 dark:bg-neutral-700'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const ProfileEdit = () => {
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();

  const [activeTab,    setActiveTab]    = useState('general');
  const [loading,      setLoading]      = useState(false);
  const [pwLoading,    setPwLoading]    = useState(false);
  const [prefLoading,  setPrefLoading]  = useState(false);
  const [savedSection, setSavedSection] = useState(null);

  const [profile, setProfile] = useState({
    name:    '',
    email:   '',
    avatar:  '',
    bio:     '',
    phone:   '',
  });

  const [socialLinks, setSocialLinks] = useState({
    linkedin: '',
    twitter:  '',
    website:  '',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    sessionReminders:   true,
    marketingEmails:    false,
    theme:    'system',
    timezone: 'UTC',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });

  const isOAuthOnly = user?.oauthProviders?.length > 0 && !user?.hasPassword;

  // ── Populate from user object ──────────────────────────────────────────────
  useEffect(() => {
    if (user) {
      setProfile({
        name:    user.name    || '',
        email:   user.email   || '',
        avatar:  user.avatar  || '',
        bio:     user.bio     || '',
        phone:   user.phone   || '',
      });
      setSocialLinks({
        linkedin: user.socialLinks?.linkedin || '',
        twitter:  user.socialLinks?.twitter  || '',
        website:  user.socialLinks?.website  || '',
      });
      setPreferences({
        emailNotifications: user.preferences?.emailNotifications ?? true,
        sessionReminders:   user.preferences?.sessionReminders   ?? true,
        marketingEmails:    user.preferences?.marketingEmails    ?? false,
        theme:    user.preferences?.theme    || 'system',
        timezone: user.preferences?.timezone || 'UTC',
      });
    }
  }, [user]);

  // ── Flash saved indicator ─────────────────────────────────────────────────
  const flashSaved = (section) => {
    setSavedSection(section);
    setTimeout(() => setSavedSection(null), 2500);
  };

  // ── Handle avatar upload ──────────────────────────────────────────────────
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast('Image must be smaller than 5MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setProfile(p => ({ ...p, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  // ── Save general profile ──────────────────────────────────────────────────
  const saveProfile = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) {
      toast('Name is required', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.put('/auth/profile/update', {
        name:        profile.name,
        avatar:      profile.avatar,
        bio:         profile.bio,
        phone:       profile.phone,
        socialLinks,
      });
      await checkAuth();
      toast('Profile updated!', 'success');
      flashSaved('general');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Save social links ─────────────────────────────────────────────────────
  const saveSocial = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/auth/profile/update', {
        name: profile.name,
        socialLinks,
      });
      await checkAuth();
      toast('Social links saved!', 'success');
      flashSaved('social');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Save preferences ──────────────────────────────────────────────────────
  const savePreferences = async () => {
    setPrefLoading(true);
    try {
      await api.put('/auth/preferences', preferences);
      await checkAuth();
      toast('Preferences saved!', 'success');
      flashSaved('preferences');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save preferences', 'error');
    } finally {
      setPrefLoading(false);
    }
  };

  // ── Change password ───────────────────────────────────────────────────────
  const changePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast('Passwords do not match', 'error');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast('Password must be at least 6 characters', 'error');
      return;
    }
    setPwLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword:     passwords.newPassword,
      });
      toast('Password changed successfully!', 'success');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      flashSaved('security');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setPwLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm";
  const labelClass = "block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5";

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
      <Navbar />

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate(-1)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Account Settings</h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage your profile, preferences and security</p>
            </div>
          </div>

          {/* Tab nav */}
          <div className="flex gap-1 bg-white dark:bg-neutral-800 p-1 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 mb-6 overflow-x-auto">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isSaved  = savedSection === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {isSaved && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >

              {/* ── GENERAL ─────────────────────────────────────────────── */}
              {activeTab === 'general' && (
                <form onSubmit={saveProfile} className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 p-6 space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      {profile.avatar ? (
                        <img src={profile.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-100 dark:ring-blue-900/50" />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-4 ring-blue-100 dark:ring-blue-900/50">
                          <span className="text-white text-2xl font-bold">{profile.name?.[0]?.toUpperCase() || 'U'}</span>
                        </div>
                      )}
                      <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center cursor-pointer shadow transition">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                      </label>
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-white">{profile.name || 'Your Name'}</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">{profile.email}</p>
                      {user?.oauthProviders?.length > 0 && (
                        <span className="inline-flex items-center gap-1 mt-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                          <svg className="w-3 h-3" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                          Google connected
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Full Name *</label>
                      <input type="text" value={profile.name} onChange={e => setProfile(p => ({...p, name: e.target.value}))} className={inputClass} placeholder="Your full name" required />
                    </div>
                    <div>
                      <label className={labelClass}>Phone Number</label>
                      <input type="tel" value={profile.phone} onChange={e => setProfile(p => ({...p, phone: e.target.value}))} className={inputClass} placeholder="+1 (555) 000-0000" />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Email Address</label>
                    <div className={`${inputClass} bg-neutral-50 dark:bg-neutral-900 cursor-not-allowed text-neutral-400`}>{profile.email}</div>
                    <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-1">Email cannot be changed directly. Contact support if needed.</p>
                  </div>

                  <div>
                    <label className={labelClass}>Bio <span className="font-normal text-neutral-400">({profile.bio.length}/500)</span></label>
                    <textarea
                      value={profile.bio}
                      onChange={e => setProfile(p => ({...p, bio: e.target.value.slice(0, 500)}))}
                      className={`${inputClass} h-28 resize-none`}
                      placeholder="Tell mentors and mentees a bit about yourself…"
                    />
                  </div>

                  <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition">
                    {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</> : <><Save className="w-4 h-4" />Save Profile</>}
                  </button>
                </form>
              )}

              {/* ── SOCIAL LINKS ────────────────────────────────────────── */}
              {activeTab === 'social' && (
                <form onSubmit={saveSocial} className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 p-6 space-y-5">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Add your professional links to help others connect with you.</p>

                  {[
                    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/yourname' },
                    { key: 'twitter',  label: 'Twitter / X', icon: Twitter, placeholder: 'https://twitter.com/yourhandle' },
                    { key: 'website',  label: 'Personal Website', icon: Globe, placeholder: 'https://yourwebsite.com' },
                  ].map(({ key, label, icon: Icon, placeholder }) => (
                    <div key={key}>
                      <label className={labelClass}>
                        <span className="flex items-center gap-1.5"><Icon className="w-4 h-4" />{label}</span>
                      </label>
                      <input
                        type="url"
                        value={socialLinks[key]}
                        onChange={e => setSocialLinks(l => ({ ...l, [key]: e.target.value }))}
                        className={inputClass}
                        placeholder={placeholder}
                      />
                    </div>
                  ))}

                  <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition">
                    {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</> : <><Save className="w-4 h-4" />Save Social Links</>}
                  </button>
                </form>
              )}

              {/* ── PREFERENCES ─────────────────────────────────────────── */}
              {activeTab === 'preferences' && (
                <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 p-6 space-y-6">
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">Notifications</h3>
                    <div className="space-y-4">
                      {[
                        { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive email updates about your bookings and messages' },
                        { key: 'sessionReminders',   label: 'Session Reminders',   desc: 'Get reminded 30 minutes before an upcoming session' },
                        { key: 'marketingEmails',    label: 'Marketing Emails',    desc: 'News, tips, and special offers from MentorConnect' },
                      ].map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-white text-sm">{label}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{desc}</p>
                          </div>
                          <Toggle
                            checked={preferences[key]}
                            onChange={val => setPreferences(p => ({ ...p, [key]: val }))}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-neutral-100 dark:border-neutral-700 pt-5">
                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">Appearance</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {['light', 'dark', 'system'].map(theme => (
                        <button
                          key={theme}
                          type="button"
                          onClick={() => setPreferences(p => ({ ...p, theme }))}
                          className={`py-3 rounded-xl border-2 font-medium text-sm capitalize transition ${preferences.theme === theme ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-600'}`}
                        >
                          {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '💻'} {theme}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-neutral-100 dark:border-neutral-700 pt-5">
                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">Timezone</h3>
                    <select
                      value={preferences.timezone}
                      onChange={e => setPreferences(p => ({ ...p, timezone: e.target.value }))}
                      className={inputClass}
                    >
                      {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                    </select>
                  </div>

                  <button onClick={savePreferences} disabled={prefLoading} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition">
                    {prefLoading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</> : <><Save className="w-4 h-4" />Save Preferences</>}
                  </button>
                </div>
              )}

              {/* ── SECURITY ─────────────────────────────────────────────── */}
              {activeTab === 'security' && (
                <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 p-6">
                  {user?.oauthProviders?.length > 0 && !user?.password ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/></svg>
                      </div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Signed in with Google</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Your account uses Google sign-in. Password management is handled by Google.</p>
                    </div>
                  ) : (
                    <form onSubmit={changePassword} className="space-y-5">
                      <div>
                        <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">Change Password</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-5">Choose a strong password with at least 6 characters.</p>
                      </div>

                      {[
                        { name: 'currentPassword', label: 'Current Password', placeholder: 'Enter your current password' },
                        { name: 'newPassword',     label: 'New Password',     placeholder: 'At least 6 characters' },
                        { name: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Repeat your new password' },
                      ].map(field => (
                        <div key={field.name}>
                          <label className={labelClass}>{field.label}</label>
                          <input
                            type="password"
                            value={passwords[field.name]}
                            onChange={e => setPasswords(p => ({ ...p, [field.name]: e.target.value }))}
                            className={inputClass}
                            placeholder={field.placeholder}
                            required
                          />
                        </div>
                      ))}

                      <button type="submit" disabled={pwLoading} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition">
                        {pwLoading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating…</> : <><Lock className="w-4 h-4" />Update Password</>}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfileEdit;
