import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import Textarea from '../components/ui/textarea.jsx';
import { toast } from '../components/ui/toaster';
import api from '../utils/api';
import logger from '../utils/logger';

const IssueReport = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'technical',
    priority: 'medium',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      toast('Please fill title and description', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.post('/issues', form);
      toast('Issue submitted. We will review it soon.', 'success');
      setForm({ title: '', description: '', type: 'technical', priority: 'medium' });
    } catch (error) {
      logger.error('Issue submit error', error);
      toast(error.response?.data?.message || 'Failed to submit issue', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-forground shadow rounded-xl p-6 sm:p-8 border border-neutral-100">
            <h1 className="text-2xl font-bold text-forground mb-2">Report an Issue</h1>
            <p className="text-forground mb-6">Tell us what went wrong. Admins will review and act.</p>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Short summary"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="outline-none"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="What happened? Any steps to reproduce?"
                  value={form.description}
                  onChange={handleChange}
                  required
                  className="outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="mt-1 w-full border rounded-md px-3 py-2 text-sm bg-background outline-none"
                  >
                    <option value="technical">Technical</option>
                    <option value="payment">Payment</option>
                    <option value="account">Account</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className="mt-1 w-full border rounded-md px-3 py-2 text-sm bg-background outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForm({ title: '', description: '', type: 'technical', priority: 'medium' })}
                  disabled={loading}
                >
                  Clear
                </Button>
                <Button type="submit" disabled={loading} className="bg-primary-600 hover:bg-primary-700">
                  {loading ? 'Submitting...' : 'Submit Issue'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default IssueReport;
