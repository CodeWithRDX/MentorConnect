import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const sections = [
    {
        id: 'acceptance',
        title: '1. Acceptance of Terms',
        body: `By accessing or using MentorConnect ("the Platform", "we", "us", or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Platform.

We reserve the right to modify these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the revised Terms. We will notify you of material changes via email or a prominent notice on the Platform.`,
    },
    {
        id: 'eligibility',
        title: '2. Eligibility',
        body: `You must be at least 18 years of age to use MentorConnect. By using the Platform, you represent and warrant that you are 18 or older and have the legal capacity to enter into these Terms.

Accounts registered on behalf of organizations require an authorized representative to accept these Terms.`,
    },
    {
        id: 'accounts',
        title: '3. Accounts & Registration',
        body: `You must provide accurate, complete, and up-to-date information when creating an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account.

Notify us immediately at support@mentorconnect.com of any unauthorized use. MentorConnect will not be liable for losses caused by unauthorized account use.`,
    },
    {
        id: 'services',
        title: '4. Use of Services',
        body: `MentorConnect provides a platform for connecting mentors and mentees. We do not employ mentors, and mentors are independent professionals.

You agree not to:
• Misrepresent your identity, credentials, or expertise.
• Use the Platform for unlawful purposes.
• Harass, threaten, or defame other users.
• Attempt to circumvent the Platform by arranging off-platform payments to avoid fees.
• Scrape, crawl, or automate access to the Platform without permission.`,
    },
    {
        id: 'payments',
        title: '5. Payments & Fees',
        body: `Mentees pay the session fee set by each mentor plus a small platform service fee. All prices are displayed before checkout.

Mentors receive their earnings, less a platform fee, within 5–7 business days of a completed session.

We use industry-standard payment processors. By making or receiving payments, you agree to their terms of service.`,
    },
    {
        id: 'cancellations',
        title: '6. Cancellations & Refunds',
        body: `Mentees may cancel a session up to 24 hours before the scheduled start time for a full refund. Cancellations within 24 hours may result in a partial charge.

In cases of genuine mentor no-shows or technical failures on our end, we will issue a full refund. Refund disputes must be raised within 48 hours of the session.`,
    },
    {
        id: 'ip',
        title: '7. Intellectual Property',
        body: `All content on MentorConnect — including logos, text, graphics, and software — is the property of MentorConnect or its licensors and is protected by applicable intellectual property laws.

Session recordings (if enabled) are owned jointly by the mentor and mentee. Neither party may distribute recordings without the other's written consent.

User-generated content (profile bios, reviews) remains yours. By posting it, you grant MentorConnect a non-exclusive, royalty-free licence to display it on the Platform.`,
    },
    {
        id: 'liability',
        title: '8. Limitation of Liability',
        body: `To the maximum extent permitted by law, MentorConnect shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Platform.

Our total liability to you for any claim arising out of these Terms or your use of the Platform shall not exceed the amount you paid us in the 3 months preceding the claim.`,
    },
    {
        id: 'disputes',
        title: '9. Dispute Resolution',
        body: `Any dispute arising from these Terms shall first be addressed through good-faith negotiation. If unresolved within 30 days, disputes will be submitted to binding arbitration under the rules of a mutually agreed arbitration body.

These Terms are governed by the laws of India. The courts of Patna, Bihar, India shall have exclusive jurisdiction for any matters not subject to arbitration.`,
    },
    {
        id: 'contact',
        title: '10. Contact Us',
        body: `If you have questions about these Terms, contact us at:

Email: legal@mentorconnect.com
Address: MentorConnect Pvt. Ltd., Patna, Bihar, India — 800001

Last updated: February 2026`,
    },
];

const TermsOfService = () => (
    <div className="min-h-screen flex flex-col bg-background">
        <Navbar />

        {/* Hero */}
        <section className="py-14 md:py-20 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-neutral-950 dark:to-neutral-900">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 mb-5">
                        <FileText className="h-7 w-7" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
                        Terms of Service
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Please read these terms carefully before using MentorConnect.
                    </p>
                    <p className="text-muted-foreground text-sm mt-2">Effective Date: 1 February 2026</p>
                </motion.div>
            </div>
        </section>

        {/* Content */}
        <section className="py-14 bg-background flex-1">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Sticky Sidebar */}
                    <aside className="hidden lg:block lg:w-64 flex-shrink-0">
                        <div className="sticky top-24 bg-card border border-border rounded-2xl p-5 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                                Sections
                            </p>
                            <nav className="space-y-1">
                                {sections.map((s) => (
                                    <a
                                        key={s.id}
                                        href={`#${s.id}`}
                                        className="block text-sm text-muted-foreground hover:text-primary-600 dark:hover:text-primary-400 py-1 transition-colors truncate"
                                    >
                                        {s.title}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <article className="flex-1 min-w-0">
                        {sections.map((s, i) => (
                            <motion.div
                                key={s.id}
                                id={s.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.03 }}
                                className="mb-10 pb-10 border-b border-border last:border-b-0 last:mb-0"
                            >
                                <h2 className="text-xl font-semibold text-foreground mb-3">{s.title}</h2>
                                <div className="text-muted-foreground text-sm leading-7 whitespace-pre-line">
                                    {s.body}
                                </div>
                            </motion.div>
                        ))}
                    </article>
                </div>
            </div>
        </section>

        <Footer />
    </div>
);

export default TermsOfService;
