import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';

const categories = [
    {
        label: 'General',
        faqs: [
            {
                q: 'What is MentorConnect?',
                a: 'MentorConnect is a virtual mentorship platform that connects ambitious professionals and entrepreneurs with vetted industry experts for 1-on-1 guidance, career coaching, and skill development.',
            },
            {
                q: 'Is MentorConnect free to use?',
                a: 'Browsing mentor profiles is completely free. Each mentor sets their own hourly rate for sessions. You only pay when you book a session.',
            },
            {
                q: 'How is MentorConnect different from other platforms?',
                a: 'Every mentor on our platform is individually reviewed and verified. We focus on quality over quantity, ensuring you get actionable, expert-led sessions — not generic advice.',
            },
            {
                q: 'Which countries does MentorConnect support?',
                a: 'MentorConnect is available globally. We have mentors and mentees in 80+ countries and support multiple payment methods for international users.',
            },
        ],
    },
    {
        label: 'For Mentees',
        faqs: [
            {
                q: 'How do I find the right mentor?',
                a: 'Use our search and filter tools to browse mentors by category, skill, availability, and hourly rate. Each profile shows reviews and session history to help you decide.',
            },
            {
                q: 'What happens during a session?',
                a: "Sessions are conducted via our integrated video platform. After booking you'll receive a confirmation with the session link. Come prepared with your goals and questions!",
            },
            {
                q: 'Can I switch mentors?',
                a: 'Absolutely. There is no commitment. You are free to book sessions with different mentors until you find the perfect fit.',
            },
            {
                q: 'What if I\'m unhappy with a session?',
                a: 'We offer a satisfaction guarantee. If a session does not meet expectations, contact our support team within 24 hours and we will work to make it right.',
            },
        ],
    },
    {
        label: 'For Mentors',
        faqs: [
            {
                q: 'How do I become a mentor on MentorConnect?',
                a: 'Apply through our Become a Mentor form. Our team reviews your experience, background, and expertise. If approved, you can set up your profile and start accepting sessions.',
            },
            {
                q: 'How and when do I get paid?',
                a: 'Earnings are transferred to your linked bank account within 5–7 business days after a completed session. You can view all transactions in your Earnings dashboard.',
            },
            {
                q: 'Can I set my own availability?',
                a: 'Yes. You control your schedule entirely. Set recurring availability windows or mark specific days off — your calendar, your rules.',
            },
            {
                q: 'Is there a revenue share?',
                a: 'MentorConnect retains a small platform fee from each transaction to cover payment processing and platform maintenance. The exact percentage is shown during onboarding.',
            },
        ],
    },
    {
        label: 'Billing & Payments',
        faqs: [
            {
                q: 'What payment methods are accepted?',
                a: 'We accept all major credit and debit cards, UPI (India), and popular digital wallets via our secure payment partner.',
            },
            {
                q: 'Is my payment information secure?',
                a: 'Yes. We never store your card details on our servers. All payments are processed through PCI-DSS compliant payment processors.',
            },
            {
                q: 'Can I get a refund?',
                a: 'Cancellations made at least 24 hours before the session are fully refundable. Late cancellations or no-shows may be subject to a partial charge.',
            },
        ],
    },
];

const AccordionItem = ({ question, answer }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="border border-border rounded-xl overflow-hidden mb-3">
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-4 text-left bg-card hover:bg-muted/60 transition-colors"
            >
                <span className="font-medium text-foreground pr-4">{question}</span>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </motion.div>
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 py-4 bg-card border-t border-border text-muted-foreground text-sm leading-relaxed">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FAQ = () => {
    const [activeTab, setActiveTab] = useState(0);

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
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 mb-6">
                            <MessageCircle className="h-8 w-8" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                            Frequently Asked Questions
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Can't find an answer? Reach out to us on the{' '}
                            <Link to="/contact" className="text-primary-600 dark:text-primary-400 hover:underline">
                                Contact page
                            </Link>
                            .
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* FAQ Content */}
            <section className="py-16 bg-background flex-1">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-2 mb-10">
                        {categories.map((cat, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveTab(i)}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors border ${activeTab === i
                                    ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                                    : 'bg-card text-muted-foreground border-border hover:border-primary-400 hover:text-primary-600'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Accordion */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                        >
                            {categories[activeTab].faqs.map((faq, i) => (
                                <AccordionItem key={i} question={faq.q} answer={faq.a} />
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {/* Still have questions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-14 p-8 rounded-2xl bg-card border border-border text-center shadow-sm"
                    >
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                            Still have questions?
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            Our team is happy to help. Reach out and we'll respond within 24 hours.
                        </p>
                        <Link to="/contact">
                            <Button>
                                Contact Us <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default FAQ;
