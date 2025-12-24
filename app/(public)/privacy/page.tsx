import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy - Travel-Coach",
  description: "Privacy Policy for Travel-Coach Baseball Team Management App",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

        <p className="text-gray-600 mb-6">
          <strong>Last Updated:</strong> December 23, 2025
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
          <p className="text-gray-700 mb-4">
            Travel-Coach (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your
            information when you use our mobile application and web service (collectively, the &quot;Service&quot;).
          </p>
          <p className="text-gray-700">
            Please read this Privacy Policy carefully. By using the Service, you agree to the
            collection and use of information in accordance with this policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>

          <h3 className="text-lg font-medium text-gray-800 mb-2">2.1 Personal Information</h3>
          <p className="text-gray-700 mb-4">
            When you create an account, we may collect:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
            <li>Name and email address (via Apple Sign In)</li>
            <li>Profile information you choose to provide</li>
            <li>Team membership and role information</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-800 mb-2">2.2 Player Information</h3>
          <p className="text-gray-700 mb-4">
            For team management purposes, coaches may enter:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
            <li>Player names, jersey numbers, and positions</li>
            <li>Birth dates and graduation years</li>
            <li>Performance metrics (velocity, sprint times)</li>
            <li>Parent/guardian contact information</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-800 mb-2">2.3 Team and Event Data</h3>
          <p className="text-gray-700 mb-4">
            We collect information related to team activities:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
            <li>Team schedules, events, and tournaments</li>
            <li>Travel and carpool arrangements</li>
            <li>Game statistics and results</li>
            <li>Team announcements and communications</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-800 mb-2">2.4 Device Information</h3>
          <p className="text-gray-700 mb-4">
            We may collect device-specific information including:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Device type and operating system</li>
            <li>Push notification tokens (for sending alerts)</li>
            <li>App usage analytics</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
          <p className="text-gray-700 mb-4">We use the collected information to:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Provide and maintain the Service</li>
            <li>Send push notifications about events, schedules, and announcements</li>
            <li>Facilitate team management and communication</li>
            <li>Track player performance and statistics</li>
            <li>Improve and personalize user experience</li>
            <li>Respond to customer service requests</li>
            <li>Send administrative information and updates</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Data Sharing and Disclosure</h2>
          <p className="text-gray-700 mb-4">
            We do not sell, trade, or rent your personal information to third parties.
            We may share information in the following circumstances:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li><strong>Within Your Team:</strong> Team members can see relevant team information based on their role</li>
            <li><strong>Service Providers:</strong> We use trusted third-party services (Firebase for push notifications, cloud hosting providers)</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            <li><strong>With Your Consent:</strong> When you explicitly agree to share information</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
          <p className="text-gray-700 mb-4">
            We implement appropriate security measures to protect your information:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Encrypted data transmission (HTTPS/TLS)</li>
            <li>Secure authentication via Apple Sign In</li>
            <li>Encrypted storage of sensitive documents</li>
            <li>Regular security assessments</li>
          </ul>
          <p className="text-gray-700 mt-4">
            However, no method of transmission over the Internet is 100% secure, and we cannot
            guarantee absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Children&apos;s Privacy</h2>
          <p className="text-gray-700 mb-4">
            Our Service is designed for coaches, parents, and team managers. While player
            information may include minors, this data is entered and managed by authorized
            adults (coaches, parents, team managers).
          </p>
          <p className="text-gray-700">
            We do not knowingly collect personal information directly from children under 13.
            If you believe we have collected information from a child under 13, please
            contact us immediately.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Your Rights and Choices</h2>
          <p className="text-gray-700 mb-4">You have the right to:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Access and review your personal information</li>
            <li>Update or correct your information</li>
            <li>Delete your account and associated data</li>
            <li>Opt out of push notifications</li>
            <li>Request a copy of your data</li>
          </ul>
          <p className="text-gray-700 mt-4">
            To exercise these rights, please use the account settings in the app or contact us directly.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Data Retention</h2>
          <p className="text-gray-700">
            We retain your information for as long as your account is active or as needed to
            provide the Service. Upon account deletion, we will delete or anonymize your
            personal information within 30 days, except where retention is required by law.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Third-Party Services</h2>
          <p className="text-gray-700 mb-4">Our Service uses the following third-party services:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li><strong>Apple Sign In:</strong> For authentication</li>
            <li><strong>Firebase Cloud Messaging:</strong> For push notifications</li>
            <li><strong>Cloud Hosting:</strong> For data storage and processing</li>
          </ul>
          <p className="text-gray-700 mt-4">
            These services have their own privacy policies governing the use of your information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
          <p className="text-gray-700">
            We may update this Privacy Policy from time to time. We will notify you of any
            changes by posting the new Privacy Policy on this page and updating the
            &quot;Last Updated&quot; date. Continued use of the Service after changes constitutes
            acceptance of the updated policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <p className="text-gray-700">
            <strong>Email:</strong> privacy@coachhub.app<br />
            <strong>Website:</strong> https://coach.z-q.me
          </p>
        </section>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            &copy; {new Date().getFullYear()} Travel-Coach. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
