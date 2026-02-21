import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Target, Heart, Shield, Zap, Users, Globe,
    Linkedin, Twitter, ArrowRight,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';

const team = [
    {
        name: 'Raushan Kumar',
        role: 'Founder & CEO',
        bio: 'Full-stack engineer passionate about democratising access to world-class mentorship.',
        initials: 'RK',
        color: 'bg-primary-600',
    },
    {
        name: 'Priya Sharma',
        role: 'Head of Product',
        bio: 'Former PM at a Fortune 500 company with a love for building user-first experiences.',
        initials: 'PS',
        color: 'bg-secondary-600',
    },
    {
        name: 'Arjun Mehta',
        role: 'Lead Engineer',
        bio: 'Open-source contributor who architected the real-time session infrastructure.',
        initials: 'AM',
        color: 'bg-accent-600',
    },
    {
        name: 'Sneha Patel',
        role: 'Community Manager',
        bio: 'Connects mentors and mentees globally, ensuring every interaction adds value.',
        initials: 'SP',
        color: 'bg-success-600',
    },
];

const values = [
    {
        icon: <Target className="h-6 w-6" />,
        title: 'Purpose-Driven',
        desc: "Every feature we build is meant to create real impact in people's careers.",
    },
    {
        icon: <Heart className="h-6 w-6" />,
        title: 'Community First',
        desc: 'We build for our community. Their growth is our north star.',
    },
    {
        icon: <Shield className="h-6 w-6" />,
        title: 'Trust & Safety',
        desc: 'Every mentor is verified. Every interaction is safe and professional.',
    },
    {
        icon: <Zap className="h-6 w-6" />,
        title: 'Continuous Growth',
        desc: 'We embrace change, learn fast, and iterate with our users.',
    },
    {
        icon: <Users className="h-6 w-6" />,
        title: 'Inclusivity',
        desc: 'Mentorship should be accessible to everyone, regardless of background.',
    },
    {
        icon: <Globe className="h-6 w-6" />,
        title: 'Global Reach',
        desc: 'Connecting talent across borders to build a world without limits.',
    },
];

const stats = [
    { value: '5,000+', label: 'Active Mentors' },
    { value: '20,000+', label: 'Mentees Helped' },
    { value: '80+', label: 'Countries Reached' },
    { value: '98%', label: 'Satisfaction Rate' },
];

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }),
};

const AboutUs = () => (
    <div className="min-h-screen flex flex-col bg-background">
        <Navbar />

        {/* Hero */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-neutral-950 dark:to-neutral-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="text-primary-600 dark:text-primary-400 font-semibold uppercase tracking-widest text-sm mb-4"
                >
                    Our Story
                </motion.p>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl md:text-6xl font-bold text-foreground mb-6"
                >
                    We're on a mission to make{' '}
                    <span className="text-primary-600 dark:text-primary-400">great mentorship</span>{' '}
                    universally accessible.
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
                >
                    MentorConnect was born from a simple belief: the right mentor can change the
                    trajectory of your career. We're building the platform that makes that connection
                    effortless.
                </motion.p>
            </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-primary-600 dark:bg-neutral-900">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {stats.map((s, i) => (
                        <motion.div
                            key={i}
                            custom={i}
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                        >
                            <p className="text-4xl font-bold text-white mb-1">{s.value}</p>
                            <p className="text-primary-100 dark:text-neutral-400 text-sm">{s.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        {/* Mission */}
        <section className="py-20 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <p className="text-primary-600 dark:text-primary-400 font-semibold uppercase tracking-widest text-sm mb-3">
                            Our Mission
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                            Breaking down barriers to expert guidance
                        </h2>
                        <p className="text-muted-foreground text-lg mb-4">
                            When we started, we noticed a painful gap: the best mentors were only accessible
                            to people already in elite circles. If you didn't have the right connections, you
                            were on your own.
                        </p>
                        <p className="text-muted-foreground text-lg">
                            MentorConnect changes that. We vet hundreds of industry experts and make them
                            available to anyone — from first-generation founders to career changers — so that
                            talent, not privilege, determines your ceiling.
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        {[
                            { num: '2023', label: 'Founded' },
                            { num: '4.9★', label: 'Avg. Mentor Rating' },
                            { num: '<24h', label: 'Avg. Response Time' },
                            { num: 'Free', label: 'To Browse Mentors' },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="p-6 rounded-2xl bg-card border border-border flex flex-col items-center text-center shadow-sm"
                            >
                                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-1">
                                    {item.num}
                                </p>
                                <p className="text-sm text-muted-foreground">{item.label}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-muted/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        The values that guide us
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        These aren't just words on a wall — they're what we optimise for every day.
                    </p>
                </motion.div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {values.map((v, i) => (
                        <motion.div
                            key={i}
                            custom={i}
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                            className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4">
                                {v.icon}
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">{v.title}</h3>
                            <p className="text-muted-foreground text-sm">{v.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        {/* Team */}
        <section className="py-20 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Meet the team
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        A small, passionate group obsessed with mentorship outcomes.
                    </p>
                </motion.div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {team.map((member, i) => (
                        <motion.div
                            key={i}
                            custom={i}
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <div
                                className={`w-20 h-20 rounded-full ${member.color} flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold`}
                            >
                                {member.initials}
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                            <p className="text-sm text-primary-600 dark:text-primary-400 mb-2">
                                {member.role}
                            </p>
                            <p className="text-sm text-muted-foreground">{member.bio}</p>
                            <div className="flex justify-center gap-3 mt-3">
                                <a href="#" className="text-muted-foreground hover:text-primary-500 transition">
                                    <Linkedin className="h-4 w-4" />
                                </a>
                                <a href="#" className="text-muted-foreground hover:text-primary-500 transition">
                                    <Twitter className="h-4 w-4" />
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-primary-600 dark:bg-neutral-950">
            <div className="max-w-3xl mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Ready to accelerate your growth?
                    </h2>
                    <p className="text-primary-100 dark:text-neutral-400 text-lg mb-8">
                        Join thousands of professionals who've transformed their careers with MentorConnect.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/select-role">
                            <Button size="lg" variant="secondary" className="text-base px-8">
                                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link to="/mentors">
                            <Button
                                size="lg"
                                variant="outline"
                                className="text-base px-8 border-white text-white hover:bg-white/10"
                            >
                                Browse Mentors
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>

        <Footer />
    </div>
);

export default AboutUs;
