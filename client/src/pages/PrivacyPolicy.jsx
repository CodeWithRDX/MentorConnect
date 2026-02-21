import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const sections = [
    {
        id: 'overview',
        title: '1. Overview',
        body: `MentorConnect ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and share information about you when you access or use our platform.

By using MentorConnect, you agree to the collection and use of information in accordance with this policy.`,
    },
    {
        id: 'collection',
        title: '2. Information We Collect',
        body: `We collect the following categories of information:

Account Information: Name, email address, password (hashed), and role (mentee/mentor).

Profile Information: Bio, profile picture, skills, experience, and any optional fields you choose to fill in.

Session Information: Booking details, session notes, and duration logs used to calculate earnings and provide receipts.

Payment Information: Billing address and last-four card digits (full card details are processed by our PCI-DSS compliant payment partner and never stored on our servers).

Usage Data: Pages visited, features used, IP address, browser type, and device identifiers collected via cookies and analytics tools.

Communications: Messages exchanged through our platform and support tickets submitted to our team.`,
    },
    {
        id: 'usage',
        title: '3. How We Use Your Information',
        body: `We use your information to:
• Create and manage your account.
• Match mentees with suitable mentors.
• Process payments and disburse mentor earnings.
• Send transactional emails (booking confirmations, receipts, password resets).
• Improve our platform through aggregate usage analytics.
• Respond to support requests.
• Comply with legal obligations and enforce our Terms of Service.

We do not sell your personal information to third parties.`,
    },
    {
        id: 'cookies',
        title: '4. Cookies & Tracking',
        body: `We use cookies and similar tracking technologies to provide and improve our services. Types of cookies we use:

Strictly Necessary: Session authentication and security tokens. These cannot be disabled.

Analytics: Aggregate statistics about how users interact with the Platform (e.g., Vercel Analytics). No personally identifiable data is retained.

Preference: Storing your theme preference (dark/light mode).

You can control non-essential cookies through your browser settings, though some features may be affected.`,
    },
    {
        id: 'sharing',
        title: '5. Sharing of Information',
        body: `We share your information only in the following circumstances:

Service Providers: Payment processors, cloud hosting providers, and email delivery services that process data on our behalf under strict data processing agreements.

Mentor-Mentee Context: Your public profile, bio, and reviews are visible to all users. During a session, mentors access only the information you share in your profile and in messages.

Legal Requirements: We will disclose information if required by law or if we believe disclosure is necessary to protect our rights, your safety, or the safety of others.

Business Transfer: In the event of a merger, acquisition, or sale of assets, your information may be transferred. We will notify you of any such change.`,
    },
    {
        id: 'retention',
        title: '6. Data Retention',
        body: `We retain personal data for as long as your account is active or as needed to provide services. If you delete your account, we will delete or anonymize your personal data within 30 days, except where we are required to retain it for legal or financial compliance (e.g., transaction records retained for 7 years).`,
    },
    {
        id: 'rights',
        title: '7. Your Rights',
        body: `Depending on your jurisdiction, you may have the following rights:

• Access: Request a copy of the personal data we hold about you.
• Rectification: Correct inaccurate or incomplete data.
• Erasure: Request deletion of your data ("right to be forgotten"), subject to legal retention requirements.
• Portability: Receive your data in a machine-readable format.
• Objection: Object to processing based on legitimate interest.
• Restriction: Request that we limit processing of your data.

To exercise these rights, email us at privacy@mentorconnect.com. We will respond within 30 days.`,
    },
    {
        id: 'security',
        title: '8. Data Security',
        body: `We implement industry-standard security measures including:
• TLS encryption for all data in transit.
• Hashed passwords (bcrypt) — we never store passwords in plain text.
• Regular security audits and vulnerability scans.
• Access controls limiting data access to authorized personnel only.

No method of transmission over the internet is 100% secure. We strive to use commercially acceptable means to protect your data but cannot guarantee absolute security.`,
    },
    {
        id: 'children',
        title: '9. Children\'s Privacy',
        body: `MentorConnect is not intended for users under the age of 18. We do not knowingly collect personal data from children. If we become aware that a child under 18 has provided us with personal information, we will delete it promptly.`,
    },
    {
        id: 'changes',
        title: '10. Changes to This Policy',
        body: `We may update this Privacy Policy from time to time. We'll notify you of significant changes via email or a prominent notice on the Platform. The "Last Updated" date at the top of this page indicates when the latest revisions were made.`,
    },
    {
        id: 'contact',
        title: '11. Contact Us',
        body: `For privacy-related questions or to exercise your rights:

Email: privacy@mentorconnect.com
Address: MentorConnect Pvt. Ltd., Patna, Bihar, India — 800001

Last updated: February 2026`,
    },
];

const PrivacyPolicy = () => (
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
                        <Shield className="h-7 w-7" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
                        Privacy Policy
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        How we collect, use, and protect your personal information.
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

export default PrivacyPolicy;
