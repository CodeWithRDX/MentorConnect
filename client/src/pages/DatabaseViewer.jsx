import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Search, Trash2, Eye, Database } from 'lucide-react';
import api from '../utils/api';
import logger from '../utils/logger';
import { toast } from '../components/ui/toaster';

const DatabaseViewer = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (tab) => {
    setLoading(true);
    try {
      let response;
      switch (tab) {
        case 'users':
          response = await api.get('/admin/all-users').catch(() => ({ data: { data: [] } }));
          break;
        case 'mentors':
          response = await api.get('/admin/all-mentors').catch(() => ({ data: { data: [] } }));
          break;
        case 'bookings':
          response = await api.get('/admin/all-bookings').catch(() => ({ data: { data: [] } }));
          break;
        default:
          response = { data: { data: [] } };
      }
      setData(response.data.data || []);
    } catch (error) {
      logger.error('Error fetching data', error);
      toast('Error fetching data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        await api.delete(`/admin/${type}/${id}`).catch(() => null);
        toast(`${type} deleted successfully`, 'success');
        fetchData(activeTab);
      } catch (error) {
        toast(`Failed to delete ${type}`, 'error');
      }
    }
  };

  const filteredData = data.filter(item => {
    const searchString = JSON.stringify(item).toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const tabs = [
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'mentors', label: 'Mentors', icon: '🎓' },
    { id: 'bookings', label: 'Bookings', icon: '📅' },
  ];

  const getColumns = (tab) => {
    switch (tab) {
      case 'users':
        return ['name', 'email', 'role', 'isEmailVerified', 'createdAt'];
      case 'mentors':
        return ['name', 'expertise', 'hourlyRate', 'isApproved', 'createdAt'];
      case 'bookings':
        return ['mentee', 'mentor', 'status', 'sessionDate', 'createdAt'];
      default:
        return [];
    }
  };

  const columns = getColumns(activeTab);

  const renderCellValue = (item, column) => {
    const value = item[column];
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? '✅ Yes' : '❌ No';
    if (typeof value === 'object') return JSON.stringify(value).substring(0, 50) + '...';
    if (typeof value === 'string' && value.length > 30) return value.substring(0, 30) + '...';
    return String(value);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="flex-1 bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Database className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Database Viewer</h1>
            </div>
            <p className="text-gray-600">View and manage all your database records</p>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label} ({data.length})
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder={`Search in ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </motion.div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500 text-lg">No records found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                      {columns.map((col) => (
                        <th
                          key={col}
                          className="px-6 py-3 text-left text-sm font-semibold text-gray-900 capitalize"
                        >
                          {col.replace(/([A-Z])/g, ' $1').trim()}
                        </th>
                      ))}
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => (
                      <motion.tr
                        key={item._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-200 hover:bg-blue-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                          {String(item._id).substring(0, 12)}...
                        </td>
                        {columns.map((col) => (
                          <td key={col} className="px-6 py-4 text-sm text-gray-600">
                            {renderCellValue(item, col)}
                          </td>
                        ))}
                        <td className="px-6 py-4 text-sm space-x-2 flex">
                          <button
                            onClick={() => setSelectedRecord(item)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition text-blue-600"
                            title="View full details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id, activeTab.slice(0, -1))}
                            className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                            title="Delete record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* Details Modal */}
          {selectedRecord && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto"
              >
                <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                  <h2 className="text-xl font-bold text-gray-900">Record Details</h2>
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm text-gray-700">
                    {JSON.stringify(selectedRecord, null, 2)}
                  </pre>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DatabaseViewer;
