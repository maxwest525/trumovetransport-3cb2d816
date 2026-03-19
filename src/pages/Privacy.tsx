import { useEffect } from "react";

import SiteShell from "@/components/layout/SiteShell";

export default function Privacy() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <SiteShell>
      
      <div className="max-w-[900px] mx-auto px-6 py-12">
        <h1 className="text-4xl font-black tracking-tight text-foreground mb-2">
          TruMove Inc. Privacy Policy
        </h1>
        <p className="text-muted-foreground mb-8">Effective Date: [Insert Date]</p>

        <div className="prose prose-neutral max-w-none">
          <p className="text-muted-foreground mb-8">
            TruMove Inc. ("TruMove," "we," "us") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and protect information when you use our websites, forms, and Services.
          </p>

          <h2 className="text-xl font-black text-foreground mt-8 mb-4">1. Information We Collect</h2>
          <p className="text-muted-foreground mb-4">We may collect:</p>

          <h3 className="text-lg font-bold text-foreground mt-6 mb-3">1.1 Information You Provide</h3>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
            <li>Name, email, phone number</li>
            <li>Move details (addresses, dates, inventory info)</li>
            <li>Communications and messages</li>
          </ul>

          <h3 className="text-lg font-bold text-foreground mt-6 mb-3">1.2 Automatically Collected Information</h3>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
            <li>IP address, browser type, device identifiers</li>
            <li>Site usage data and interactions</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>

          <h3 className="text-lg font-bold text-foreground mt-6 mb-3">1.3 Information From Service Providers</h3>
          <p className="text-muted-foreground mb-4">
            We may receive data from analytics providers, advertising platforms, call tracking vendors, and form tools used to run and optimize our Services.
          </p>

          <h2 className="text-xl font-black text-foreground mt-8 mb-4">2. How We Use Information</h2>
          <p className="text-muted-foreground mb-2">We use information to:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
            <li>Provide brokerage services and respond to inquiries</li>
            <li>Coordinate with FMCSA-authorized motor carriers</li>
            <li>Communicate about quotes, consultations, and updates</li>
            <li>Improve our Services, train staff, and maintain quality</li>
            <li>Prevent fraud and protect security</li>
            <li>Comply with legal and regulatory obligations</li>
          </ul>

          <h2 className="text-xl font-black text-foreground mt-8 mb-4">3. How We Share Information</h2>
          <p className="text-muted-foreground mb-2">We may share information with:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
            <li>FMCSA-authorized motor carriers for transportation coordination</li>
            <li>Vendors that support our business (CRM, email/SMS, analytics, call tracking)</li>
            <li>Legal, compliance, or security partners when required</li>
          </ul>
          <p className="text-muted-foreground mb-4">
            We do not sell your personal information in the traditional sense. We do not permit service providers to use your information for unrelated purposes beyond providing services to TruMove.
          </p>

          <h2 className="text-xl font-black text-foreground mt-8 mb-4">4. Cookies and Tracking</h2>
          <p className="text-muted-foreground mb-2">We use cookies and similar technologies to:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
            <li>Operate site functionality</li>
            <li>Measure performance and conversions</li>
            <li>Improve your experience</li>
            <li>Support advertising and attribution</li>
          </ul>
          <p className="text-muted-foreground mb-4">
            You may control cookies through your browser settings. Disabling cookies may limit site functionality.
          </p>

          <h2 className="text-xl font-black text-foreground mt-8 mb-4">5. Communications, TCPA, and SMS</h2>
          <p className="text-muted-foreground mb-4">
            If you provide your phone number, you consent to receive calls and texts from TruMove, including via automated technology where permitted by law. You may opt out by:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
            <li>Replying STOP to texts</li>
            <li>Following email unsubscribe instructions</li>
          </ul>
          <p className="text-muted-foreground mb-4">Message and data rates may apply.</p>

          <h2 className="text-xl font-black text-foreground mt-8 mb-4">6. Data Retention</h2>
          <p className="text-muted-foreground mb-2">We retain personal information as long as reasonably necessary for:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
            <li>Business operations</li>
            <li>Legal and compliance obligations</li>
            <li>Dispute resolution</li>
            <li>Security and fraud prevention</li>
          </ul>

          <h2 className="text-xl font-black text-foreground mt-8 mb-4">7. Security</h2>
          <p className="text-muted-foreground mb-4">
            We use reasonable administrative, technical, and physical safeguards to protect your information. No system is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="text-xl font-black text-foreground mt-8 mb-4">8. Children's Privacy</h2>
          <p className="text-muted-foreground mb-4">
            Our Services are not intended for children under 13, and we do not knowingly collect information from children.
          </p>

          <h2 className="text-xl font-black text-foreground mt-8 mb-4">9. Your Rights and Choices</h2>
          <p className="text-muted-foreground mb-2">Depending on your location, you may have rights to:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
            <li>Access, correct, or delete your information</li>
            <li>Opt out of certain communications</li>
            <li>Request information about how we use and share data</li>
          </ul>
          <p className="text-muted-foreground mb-4">
            To submit a request, contact: <a href="mailto:privacy@trumove.com" className="text-primary hover:underline">privacy@trumove.com</a>
          </p>

          <h2 className="text-xl font-black text-foreground mt-8 mb-4">California Privacy Rights Addendum (CPRA)</h2>
          <p className="text-muted-foreground mb-4">This section applies only to California residents.</p>

          <h3 className="text-lg font-bold text-foreground mt-6 mb-3">A. Categories of Personal Information Collected (Past 12 Months)</h3>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
            <li>Identifiers (name, phone, email, IP)</li>
            <li>Internet activity data (site activity, device info)</li>
            <li>Commercial information (move-related details)</li>
            <li>Communications (call and message records)</li>
          </ul>

          <h3 className="text-lg font-bold text-foreground mt-6 mb-3">B. Purposes for Collection</h3>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
            <li>Providing and improving Services</li>
            <li>Communication and coordination with carriers</li>
            <li>Analytics, security, and fraud prevention</li>
            <li>Legal and compliance obligations</li>
          </ul>

          <h3 className="text-lg font-bold text-foreground mt-6 mb-3">C. Sale or Sharing</h3>
          <p className="text-muted-foreground mb-4">
            TruMove does not sell personal information as defined by CPRA. TruMove may share limited information with service providers and carriers strictly for business purposes.
          </p>

          <h3 className="text-lg font-bold text-foreground mt-6 mb-3">D. California Rights</h3>
          <p className="text-muted-foreground mb-2">You may request:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
            <li>Access to personal information</li>
            <li>Deletion (subject to legal exceptions)</li>
            <li>Correction</li>
            <li>Information about disclosures</li>
            <li>To limit the use of sensitive personal information (where applicable)</li>
          </ul>

          <h3 className="text-lg font-bold text-foreground mt-6 mb-3">E. Submitting Requests</h3>
          <p className="text-muted-foreground mb-4">
            Email: <a href="mailto:privacy@trumove.com" className="text-primary hover:underline">privacy@trumove.com</a><br />
            Phone: 609-727-7647
          </p>
          <p className="text-muted-foreground mb-4">We may verify your identity before completing requests.</p>

          <h3 className="text-lg font-bold text-foreground mt-6 mb-3">F. Non-Discrimination</h3>
          <p className="text-muted-foreground mb-4">
            We will not discriminate against you for exercising your privacy rights.
          </p>

          <h2 className="text-xl font-black text-foreground mt-8 mb-4">10. Changes to This Policy</h2>
          <p className="text-muted-foreground mb-4">
            We may update this Privacy Policy from time to time. Updates become effective when posted with a revised Effective Date.
          </p>
        </div>
      </div>
    </SiteShell>
  );
}
