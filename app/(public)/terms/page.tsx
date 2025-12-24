import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service - Travel-Coach",
  description: "Terms of Service for Travel-Coach Baseball Team Management App",
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>

        <p className="text-gray-600 mb-6">
          <strong>Last Updated:</strong> December 23, 2025
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
          <p className="text-gray-700 mb-4">
            By accessing or using Travel-Coach (&quot;the Service&quot;), you agree to be bound by these
            Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not
            access or use the Service.
          </p>
          <p className="text-gray-700">
            These Terms apply to all visitors, users, and others who access or use the Service,
            including coaches, team managers, parents, and players.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
          <p className="text-gray-700 mb-4">
            Travel-Coach is a team management platform designed for travel baseball teams. The Service provides:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Team roster and player information management</li>
            <li>Schedule and event management</li>
            <li>Tournament and travel coordination</li>
            <li>Performance tracking and statistics</li>
            <li>Team communications and announcements</li>
            <li>Document storage and management</li>
            <li>Push notifications for important updates</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>

          <h3 className="text-lg font-medium text-gray-800 mb-2">3.1 Account Creation</h3>
          <p className="text-gray-700 mb-4">
            To use certain features of the Service, you must create an account using Apple Sign In.
            You are responsible for maintaining the confidentiality of your account and for all
            activities that occur under your account.
          </p>

          <h3 className="text-lg font-medium text-gray-800 mb-2">3.2 Account Requirements</h3>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
            <li>You must be at least 18 years old to create an account</li>
            <li>You must provide accurate and complete information</li>
            <li>You must not create accounts for fraudulent purposes</li>
            <li>You are responsible for your account security</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-800 mb-2">3.3 Team Roles</h3>
          <p className="text-gray-700">
            Different user roles (Head Coach, Assistant Coach, Team Manager, Parent, Player) have
            different permissions within the Service. You agree to use the Service only within
            the scope of your assigned role.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">4. User Responsibilities</h2>
          <p className="text-gray-700 mb-4">By using the Service, you agree to:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Provide accurate information about players and team members</li>
            <li>Obtain necessary consent before entering personal information about others</li>
            <li>Use the Service only for legitimate team management purposes</li>
            <li>Not share login credentials with unauthorized individuals</li>
            <li>Notify us immediately of any unauthorized account access</li>
            <li>Comply with all applicable laws and regulations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Prohibited Activities</h2>
          <p className="text-gray-700 mb-4">You may not use the Service to:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Violate any laws or regulations</li>
            <li>Infringe on the rights of others</li>
            <li>Transmit harmful, offensive, or inappropriate content</li>
            <li>Attempt to gain unauthorized access to the Service</li>
            <li>Interfere with or disrupt the Service</li>
            <li>Collect information about other users without consent</li>
            <li>Use the Service for commercial purposes not related to team management</li>
            <li>Reverse engineer or attempt to extract source code</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Content and Data</h2>

          <h3 className="text-lg font-medium text-gray-800 mb-2">6.1 Your Content</h3>
          <p className="text-gray-700 mb-4">
            You retain ownership of the content you submit to the Service. By submitting content,
            you grant us a license to use, store, and process that content to provide the Service.
          </p>

          <h3 className="text-lg font-medium text-gray-800 mb-2">6.2 Player Information</h3>
          <p className="text-gray-700 mb-4">
            When entering player information, especially for minors, you represent that you have
            obtained appropriate consent from parents or guardians. You are responsible for the
            accuracy of this information.
          </p>

          <h3 className="text-lg font-medium text-gray-800 mb-2">6.3 Data Export</h3>
          <p className="text-gray-700">
            You may request an export of your team data at any time through the account settings
            or by contacting us.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
          <p className="text-gray-700 mb-4">
            The Service and its original content (excluding user-submitted content), features,
            and functionality are owned by Travel-Coach and are protected by international copyright,
            trademark, and other intellectual property laws.
          </p>
          <p className="text-gray-700">
            You may not copy, modify, distribute, or create derivative works of any part of the
            Service without our express written permission.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Third-Party Services</h2>
          <p className="text-gray-700 mb-4">
            The Service may integrate with or link to third-party services (such as Apple Sign In
            and Firebase). Your use of these third-party services is subject to their respective
            terms and privacy policies.
          </p>
          <p className="text-gray-700">
            We are not responsible for the content or practices of any third-party services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Disclaimers</h2>
          <p className="text-gray-700 mb-4">
            THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
            EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
          <p className="text-gray-700">
            We do not warrant that the Service will be uninterrupted, error-free, or secure.
            We are not responsible for any errors in player statistics or scheduling information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
          <p className="text-gray-700 mb-4">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, TRAVEL-COACH SHALL NOT BE LIABLE FOR ANY
            INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS
            OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
          </p>
          <p className="text-gray-700">
            In no event shall our total liability exceed the amount you paid to use the Service
            in the twelve (12) months prior to the claim, or $100, whichever is greater.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Indemnification</h2>
          <p className="text-gray-700">
            You agree to indemnify and hold harmless Travel-Coach and its officers, directors,
            employees, and agents from any claims, damages, losses, liabilities, and expenses
            (including attorneys&apos; fees) arising from your use of the Service, violation of
            these Terms, or infringement of any rights of another.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Termination</h2>
          <p className="text-gray-700 mb-4">
            We may terminate or suspend your account and access to the Service immediately,
            without prior notice, for any reason, including if you breach these Terms.
          </p>
          <p className="text-gray-700">
            Upon termination, your right to use the Service will cease immediately. You may
            request a copy of your data within 30 days of termination.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
          <p className="text-gray-700">
            We reserve the right to modify these Terms at any time. We will notify users of
            material changes by posting the updated Terms and updating the &quot;Last Updated&quot; date.
            Your continued use of the Service after changes constitutes acceptance of the
            modified Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">14. Governing Law</h2>
          <p className="text-gray-700">
            These Terms shall be governed by and construed in accordance with the laws of the
            United States, without regard to its conflict of law provisions. Any disputes
            arising from these Terms shall be resolved in the courts of the United States.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">15. Severability</h2>
          <p className="text-gray-700">
            If any provision of these Terms is found to be unenforceable or invalid, that
            provision shall be limited or eliminated to the minimum extent necessary, and the
            remaining provisions shall remain in full force and effect.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">16. Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have questions about these Terms, please contact us:
          </p>
          <p className="text-gray-700">
            <strong>Email:</strong> legal@coachhub.app<br />
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
