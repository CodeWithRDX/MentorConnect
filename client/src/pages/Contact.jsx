import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Linkedin, Twitter, Github, Send, CheckCircle, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import api from '../utils/api';

const contactInfo = [
    {
        icon: <Mail className="h-5 w-5" />,
        label: 'Email',
        value: 'support@mentorconnect.com',
        href: 'mailto:support@mentorconnect.com',
    },
    {
        icon: <Linkedin className="h-5 w-5" />,
        label: 'LinkedIn',
        value: 'linkedin.com/company/mentorconnect',
        href: '#',
    },
    {
        icon: <Twitter className="h-5 w-5" />,
        label: 'Twitter / X',
        value: '@MentorConnectHQ',
        href: '#',
    },
    {
        icon: <Github className="h-5 w-5" />,
        label: 'GitHub',
        value: 'github.com/CodeWithRDX',
        href: 'https://github.com/CodeWithRDX',
    },
];

const subjects = [
    'General Inquiry',
    'Mentor Application',
    'Billing / Payment',
    'Technical Issue',
    'Partnership',
    'Other',
];

const Contact = () => {
    const [form, setForm] = useState({ name: '', email: '', subject: subjects[0], message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setError('');
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/contact', form);
            setSubmitted(true);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Something went wrong. Please try again or email us directly.',
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />

            {/* Hero */}
            <section className="py-16 md:py-24 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-neutral-950 dark:to-neutral-900">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <p className="text-primary-600 dark:text-primary-400 font-semibold uppercase tracking-widest text-sm mb-3">
                            Get in Touch
                        </p>
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                            We'd love to hear from you
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Have a question, idea, or feedback? Drop us a message and our team will
                            get back to you within 24 hours.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16 bg-background flex-1">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

                        {/* Contact Info Panel */}
                        <div className="lg:col-span-2">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <h2 className="text-2xl font-bold text-foreground mb-6">Contact Info</h2>
                                <div className="space-y-4 mb-10">
                                    {contactInfo.map((info, i) => (
                                        <a
                                            key={i}
                                            href={info.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary-400 transition-colors shadow-sm group"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                                {info.icon}
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
                                                    {info.label}
                                                </p>
                                                <p className="text-sm text-foreground">{info.value}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>

                                {/* Office Hours */}
                                <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
                                    <h3 className="font-semibold text-foreground mb-3">Support Hours</h3>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex justify-between">
                                            <span>Mon – Fri</span>
                                            <span className="text-foreground font-medium">9 AM – 6 PM IST</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Saturday</span>
                                            <span className="text-foreground font-medium">10 AM – 2 PM IST</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Sunday</span>
                                            <span className="text-muted-foreground">Closed</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-3">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="bg-card border border-border rounded-2xl shadow-sm p-8"
                            >
                                {submitted ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                                            className="w-16 h-16 rounded-full bg-success-100 dark:bg-success-900/40 text-success-600 dark:text-success-400 flex items-center justify-center mb-5"
                                        >
                                            <CheckCircle className="h-8 w-8" />
                                        </motion.div>
                                        <h3 className="text-2xl font-bold text-foreground mb-2">Message Sent!</h3>
                                        <p className="text-muted-foreground mb-6">
                                            Thanks for reaching out. Our team will get back to you within 24 hours.
                                        </p>
                                        <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: subjects[0], message: '' }); }}>
                                            Send another message
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <h2 className="text-2xl font-bold text-foreground mb-1">Send a Message</h2>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Fill in the form below and we'll respond promptly.
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-1.5">
                                                    Your Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    required
                                                    value={form.name}
                                                    onChange={handleChange}
                                                    placeholder="Raushan Kumar"
                                                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition placeholder:text-muted-foreground"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-1.5">
                                                    Email Address <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    required
                                                    value={form.email}
                                                    onChange={handleChange}
                                                    placeholder="you@example.com"
                                                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition placeholder:text-muted-foreground"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                                Subject
                                            </label>
                                            <select
                                                name="subject"
                                                value={form.subject}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                                            >
                                                {subjects.map((s) => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                                Message <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                name="message"
                                                required
                                                rows={6}
                                                value={form.message}
                                                onChange={handleChange}
                                                placeholder="Tell us how we can help you..."
                                                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition resize-none placeholder:text-muted-foreground"
                                            />
                                        </div>

                                        {/* Error banner */}
                                        {error && (
                                            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                                                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                <p>{error}</p>
                                            </div>
                                        )}

                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4" />
                                                    Send Message
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Prompt */}
            <section className="py-10 bg-muted/40">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <p className="text-muted-foreground text-sm">
                        Looking for quick answers?{' '}
                        <a href="/faq" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                            Browse our FAQ page →
                        </a>
                    </p>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Contact;
