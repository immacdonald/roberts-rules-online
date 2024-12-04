import { FC, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Page } from '../../components';
import './TermsOfUse.module.scss';

const TermsOfUse: FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <Page>
            <Helmet>
                <title>Home - Robert's Rules</title>
            </Helmet>
            <div className="terms-container">
                <h1>Terms of Use for Robert's Rules Online</h1>

                <section>
                    <h2>Welcome to Robert's Rules Online!</h2>
                    <p>
                        By accessing or using our platform, you agree to comply with the following Terms of Use. These terms govern your use of the website, including its features and services, and
                        form a binding agreement between you and Robert's Rules Online. If you do not agree with these terms, please do not use our platform.
                    </p>
                </section>

                <section>
                    <h2>Acceptance of Terms</h2>
                    <p>
                        By using Robert's Rules Online ("the Platform"), you agree to abide by these Terms of Use and all applicable laws and regulations. If you are using the Platform on behalf of an
                        organization, you represent that you have the authority to bind that organization to these terms.
                    </p>
                </section>

                <section>
                    <h2>Changes to the Terms</h2>
                    <p>
                        We may update or revise these Terms of Use at any time. Changes will be effective immediately upon posting on the website. We encourage you to review these terms regularly to
                        stay informed about any updates.
                    </p>
                </section>

                <section>
                    <h2>User Registration and Account Security</h2>
                    <p>
                        To use certain features of the Platform, you may need to register for an account. You are responsible for providing accurate information and maintaining the confidentiality of
                        your account credentials. You agree to notify us immediately of any unauthorized use of your account.
                    </p>
                </section>

                <section>
                    <h2>Use of the Platform</h2>
                    <div>
                        You may use Robert's Rules Online solely for lawful purposes and in accordance with these Terms. You agree not to:
                        <li>Violate any applicable laws, regulations, or rights of others.</li>
                        <li>Engage in abusive, defamatory, or disruptive behavior.</li>
                        <li>Use the Platform for any fraudulent, illegal, or harmful activities.</li>
                    </div>
                </section>

                <section>
                    <h2>Platform Features</h2>
                    <p>
                        Robert's Rules Online provides tools and features to streamline meetings and enhance collaboration. You agree to use these tools responsibly and respect the rights of all users
                        participating in the platform's features, including motions, votes, and discussions.
                    </p>
                </section>

                <section>
                    <h2>Intellectual Property</h2>
                    <p>
                        All content and materials provided on Robert's Rules Online, including text, images, logos, and software, are the property of Robert's Rules Online or its licensors. You may
                        not reproduce, modify, distribute, or create derivative works based on the content without our prior written consent.
                    </p>
                </section>

                <section>
                    <h2>Privacy</h2>
                    <p>
                        Your use of the Platform is also governed by our Privacy Policy, which outlines how we collect, use, and protect your personal information. By using Robert's Rules Online, you
                        consent to the practices described in the Privacy Policy.
                    </p>
                </section>

                <section>
                    <h2>Limitation of Liability</h2>
                    <p>
                        Robert's Rules Online will not be held liable for any direct, indirect, incidental, or consequential damages arising from your use of the Platform or any inability to access or
                        use it. We do not guarantee that the Platform will be error-free or available at all times.
                    </p>
                </section>

                <section>
                    <h2>Termination</h2>
                    <p>
                        We reserve the right to suspend or terminate your account or access to the Platform at any time, without notice, if you violate these Terms of Use or engage in behavior that we
                        deem harmful or inappropriate.
                    </p>
                </section>

                <section>
                    <h2>Governing Law</h2>
                    <p>These Terms of Use are governed by the laws of your jurisdiction. Any disputes arising from or related to these terms shall be resolved in the courts of your jurisdiction.</p>
                </section>

                <section>
                    <h2>Contact Us</h2>
                    <p>If you have any questions or concerns about these Terms of Use, please contact us at:</p>
                    <div>
                        <li>
                            Email: <a href="mailto:test@email.com">test@email.com</a>
                        </li>
                        <li>Phone: 111-1111-1111</li>
                        <li>Address: 1 St SE, Williamsburg, VA</li>
                    </div>
                </section>

                <section>
                    <p>By using Robert's Rules Online, you acknowledge that you have read, understood, and agree to these Terms of Use.</p>
                    <p>Effective Date: 12/3/2024</p>
                </section>
            </div>
        </Page>
    );
};

export { TermsOfUse };
