import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Target, Heart, Shield, Zap, Users, Globe,
    Linkedin, Twitter, Github, Instagram, ArrowRight,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';

import raushanImg from '../assets/team/raushan_kumar.png';
import ankitImg from '../assets/team/ankit_meena.png';

const team = [
    {
        name: 'Raushan Kumar',
        role: 'Founder & CEO',
        bio: 'Full-stack engineer passionate about democratising access to world-class mentorship. Building the bridge between talent and opportunity.',
        image: raushanImg,
        gradient: 'from-primary-600/90 to-primary-900/90',
        backGradient: 'from-primary-700 to-primary-900',
        social: {
            linkedin: 'https://www.linkedin.com/in/raushankumar1/',
            github: 'https://github.com/CodeWithRDX',
        },
    },
    {
        name: 'Ankit Meena',
        role: 'Co-Founder & Head of Product',
        bio: 'Full-stack engineer passionate about creating intuitive products that make mentorship effortless and impactful for everyone.',
        image: ankitImg,
        gradient: 'from-secondary-600/90 to-secondary-900/90',
        backGradient: 'from-secondary-700 to-secondary-900',
        social: {
            linkedin: 'https://www.linkedin.com/in/ankit-meena77/',
            github: 'https://github.com/Ankitmina25',
        },
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
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <p className="text-primary-600 dark:text-primary-400 font-semibold uppercase tracking-widest text-sm mb-3">
                        Leadership
                    </p>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Meet the Founders
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        A passionate duo building the future of mentorship. Hover to learn more.
                    </p>
                </motion.div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-3xl mx-auto">
                    {team.map((member, i) => (
                        <motion.div
                            key={i}
                            custom={i}
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                            className="flip-card h-[420px] cursor-pointer"
                        >
                            <div className="flip-card-inner">
                                {/* ── Front ── */}
                                <div className="flip-card-front shadow-xl">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Gradient overlay */}
                                    {/* <div className={`absolute inset-0 bg-gradient-to-t ${member.gradient}`} style={{ top: '65%' }} /> */}
                                    {/* Text overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                        <h3 className="text-xl font-bold mb-1 drop-shadow-lg">
                                            {member.name}
                                        </h3>
                                        <p className="text-sm font-medium text-white/80">
                                            {member.role}
                                        </p>
                                    </div>
                                    {/* Hover hint */}
                                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white font-medium">
                                        Hover me
                                    </div>
                                </div>

                                {/* ── Back ── */}
                                <div className={`flip-card-back bg-gradient-to-br ${member.backGradient} shadow-xl flex flex-col items-center justify-center text-center p-8`}>
                                    {/* Decorative pattern */}
                                    <div className="absolute inset-0 opacity-10">
                                        <div className="absolute top-6 left-6 w-20 h-20 border-2 border-white rounded-full" />
                                        <div className="absolute bottom-6 right-6 w-32 h-32 border-2 border-white rounded-full" />
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white rounded-full" />
                                    </div>

                                    {/* Content */}
                                    <div className="relative z-10">
                                        <div className="w-20 h-20 rounded-full border-4 border-white/30 overflow-hidden mx-auto mb-4">
                                            <img
                                                src={member.image}
                                                alt={member.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-1">
                                            {member.name}
                                        </h3>
                                        <p className="text-sm font-medium text-white/70 mb-4">
                                            {member.role}
                                        </p>
                                        <p className="text-sm text-white/80 leading-relaxed mb-6 max-w-[260px] mx-auto">
                                            {member.bio}
                                        </p>

                                        {/* Social icons */}
                                        <div className="flex justify-center gap-3">
                                            {[
                                                { icon: Linkedin, href: member.social.linkedin, label: 'LinkedIn' },
                                                { icon: Github, href: member.social.github, label: 'GitHub' },
                                            ].map((s) => (
                                                <a
                                                    key={s.label}
                                                    href={s.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label={s.label}
                                                    className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
                                                >
                                                    <s.icon className="h-4 w-4" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
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
