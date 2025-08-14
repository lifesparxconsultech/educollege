import React from 'react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-edu-primary to-edu-primary-dark text-white section-padding">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Privacy Policy
                        </h1>
                        <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
                            Your privacy is important to us. Learn how we collect, use, and protect your information.
                        </p>
                    </div>
                </div>
            </section>

            {/* Privacy Policy Content */}
            <section className="py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>1. Information We Collect</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold mb-2">Personal Information</h4>
                                    <p className="text-muted-foreground">
                                        We collect personal information that you provide to us, including but not limited to:
                                    </p>
                                    <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
                                        <li>Name, email address, and phone number</li>
                                        <li>Educational background and qualifications</li>
                                        <li>Professional experience and career goals</li>
                                        <li>Payment information for course enrollment</li>
                                        <li>Communication preferences</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">Automatically Collected Information</h4>
                                    <p className="text-muted-foreground">
                                        We automatically collect certain information when you use our website, including:
                                    </p>
                                    <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
                                        <li>IP address and browser information</li>
                                        <li>Device type and operating system</li>
                                        <li>Pages visited and time spent on our website</li>
                                        <li>Referring website and search terms</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>2. How We Use Your Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">
                                    We use the information we collect for the following purposes:
                                </p>
                                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                    <li>To provide and improve our educational services</li>
                                    <li>To communicate with you about programs, updates, and promotions</li>
                                    <li>To process applications and enrollment requests</li>
                                    <li>To provide customer support and respond to inquiries</li>
                                    <li>To personalize your experience on our website</li>
                                    <li>To comply with legal obligations and protect our rights</li>
                                    <li>To analyze website usage and improve our services</li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>3. Information Sharing and Disclosure</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-muted-foreground">
                                    We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
                                </p>
                                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                    <li><strong>Partner Universities:</strong> With educational institutions to facilitate program enrollment</li>
                                    <li><strong>Service Providers:</strong> With trusted third-party vendors who assist in our operations</li>
                                    <li><strong>Legal Requirements:</strong> When required by law or to protect our legal rights</li>
                                    <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
                                    <li><strong>Consent:</strong> When you explicitly consent to sharing</li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>4. Data Security</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">
                                    We implement appropriate technical and organizational measures to protect your personal information, including:
                                </p>
                                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                    <li>Encryption of sensitive data in transit and at rest</li>
                                    <li>Regular security assessments and updates</li>
                                    <li>Access controls and authentication measures</li>
                                    <li>Employee training on data protection practices</li>
                                    <li>Secure data backup and recovery procedures</li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>5. Your Rights and Choices</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">
                                    You have the following rights regarding your personal information:
                                </p>
                                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                    <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                                    <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                                    <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                                    <li><strong>Portability:</strong> Request transfer of your data to another service provider</li>
                                    <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
                                    <li><strong>Consent Withdrawal:</strong> Withdraw consent for data processing where applicable</li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>6. Cookies and Tracking Technologies</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">
                                    We use cookies and similar technologies to enhance your browsing experience:
                                </p>
                                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                    <li><strong>Essential Cookies:</strong> Required for website functionality and security</li>
                                    <li><strong>Performance Cookies:</strong> Help us understand how visitors use our website</li>
                                    <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                                    <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
                                </ul>
                                <p className="text-muted-foreground mt-4">
                                    You can control cookie settings through your browser preferences, though some features may not function properly if cookies are disabled.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>7. Data Retention</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy,
                                    comply with legal obligations, resolve disputes, and enforce our agreements. Specific retention periods vary
                                    based on the type of information and legal requirements.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>8. International Data Transfers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    If you are located outside India, please be aware that your information may be transferred to and processed
                                    in India, where our servers are located. We ensure appropriate safeguards are in place to protect your
                                    information in accordance with applicable data protection laws.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>9. Children's Privacy</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Our services are not intended for children under 18 years of age. We do not knowingly collect personal
                                    information from children under 18. If we become aware that we have collected such information, we will
                                    take steps to delete it promptly.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>10. Updates to This Policy</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.
                                    We will notify you of any material changes by posting the updated policy on our website and updating the
                                    "Last Updated" date. Your continued use of our services after such changes constitutes acceptance of the
                                    updated policy.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>11. Contact Us</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">
                                    If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices,
                                    please contact us:
                                </p>
                                <div className="space-y-2 text-muted-foreground">
                                    <p><strong>Email:</strong> privacy@eduplatform.com</p>
                                    <p><strong>Phone:</strong> +91 1234567890</p>
                                    <p><strong>Address:</strong> EduPlatform Privacy Office, New Delhi, India</p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="text-center text-sm text-muted-foreground mt-8">
                            <p>Last Updated: January 1, 2024</p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default PrivacyPolicy;