import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteShell from "@/components/layout/SiteShell";

export default function SmsConsent() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "SMS Consent & Communications Policy | TruMove Inc.";
  }, []);

  return (
    <SiteShell hideTrustStrip>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/[0.06] blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
        </div>
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-2">
            SMS Consent & Communications Policy
          </h1>
          <p className="text-muted-foreground mb-2">TruMove Inc.</p>
          <p className="text-muted-foreground mb-8">
            TruMove Inc. complies with all applicable U.S. messaging laws including the Telephone Consumer Protection Act (TCPA) and CTIA Messaging Principles and Best Practices.
          </p>

          <div className="prose prose-neutral max-w-none">
            {/* Section 1 */}
            <h2 className="text-xl font-black text-foreground mt-8 mb-4">1. Consent to Receive Messages</h2>
            <p className="text-muted-foreground mb-4">
              Consent is obtained exclusively during a live phone call prior to any SMS being sent. Customers must explicitly agree after hearing the following:
            </p>
            <blockquote className="border-l-4 border-primary/40 pl-4 py-2 my-4 bg-muted/30 rounded-r-lg">
              <p className="text-muted-foreground italic text-sm leading-relaxed">
                "Before I send you your estimate and documents via text message, I need your permission.
                By agreeing, you consent to receive SMS messages from TruMove regarding your estimate, account notifications, and document links.
                These messages may be sent using automated technology.
                Message and data rates may apply.
                You can reply STOP at any time to opt out or HELP for assistance.
                Do you agree to receive text messages from TruMove?"
              </p>
            </blockquote>
            <p className="text-muted-foreground mb-4">
              An explicit "Yes" response is required before any SMS message is sent.
            </p>

            {/* Section 2 */}
            <h2 className="text-xl font-black text-foreground mt-8 mb-4">2. Consent Records</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
              <li>All calls where consent is obtained are recorded</li>
              <li>Consent is timestamped and linked to the customer's phone number</li>
              <li>Records are stored securely in our CRM system</li>
              <li>Consent records are available for compliance audits upon request</li>
            </ul>

            {/* Section 3 */}
            <h2 className="text-xl font-black text-foreground mt-8 mb-4">3. Message Type</h2>
            <p className="text-muted-foreground mb-2">
              All SMS messages sent by TruMove are <strong className="text-foreground">strictly transactional</strong>, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
              <li>Estimate delivery</li>
              <li>Document signing links</li>
              <li>Account updates and notifications</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              TruMove does not send marketing, promotional, or cold outreach messages. We do not use third-party lists or affiliate messaging.
            </p>

            {/* Section 4 */}
            <h2 className="text-xl font-black text-foreground mt-8 mb-4">4. Message Frequency</h2>
            <p className="text-muted-foreground mb-4">
              Message frequency varies based on user interaction. You will only receive messages related to services you have requested.
            </p>

            {/* Section 5 */}
            <h2 className="text-xl font-black text-foreground mt-8 mb-4">5. Opt-Out</h2>
            <p className="text-muted-foreground mb-4">
              Reply <strong className="text-foreground">STOP</strong> to any message to unsubscribe at any time. Upon receipt of a STOP request, you will be immediately removed from all SMS communications and will receive a single confirmation message.
            </p>

            {/* Section 6 */}
            <h2 className="text-xl font-black text-foreground mt-8 mb-4">6. Help</h2>
            <p className="text-muted-foreground mb-4">
              Reply <strong className="text-foreground">HELP</strong> to any message for assistance, or contact us directly:
            </p>
            <ul className="list-none text-muted-foreground space-y-1 mb-4">
              <li>Email: <a href="mailto:info@trumoveinc.com" className="text-primary hover:underline">info@trumoveinc.com</a></li>
              <li>Phone: <a href="tel:+12018208143" className="text-primary hover:underline">201-820-8143</a></li>
            </ul>

            {/* Section 7 */}
            <h2 className="text-xl font-black text-foreground mt-8 mb-4">7. Data Protection</h2>
            <p className="text-muted-foreground mb-4">
              We do not sell, rent, or share your phone number for marketing purposes. Phone numbers are used solely for fulfilling customer-requested services. For full details, see our{" "}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>

            {/* Section 8 */}
            <h2 className="text-xl font-black text-foreground mt-8 mb-4">8. Carrier Compliance</h2>
            <p className="text-muted-foreground mb-4">
              All messaging adheres to TCPA, CTIA Messaging Principles and Best Practices, and carrier-specific guidelines (T-Mobile, AT&T, Verizon). TruMove prohibits all SHAFT content (Sex, Hate, Alcohol, Firearms, Tobacco) in messaging.
            </p>

            {/* Cross-links */}
            <div className="mt-12 pt-8 border-t border-border">
              <h2 className="text-lg font-bold text-foreground mb-3">Related Policies</h2>
              <ul className="list-none text-muted-foreground space-y-2">
                <li>
                  <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> - How we collect, use, and protect your data
                </li>
                <li>
                  <Link to="/terms" className="text-primary hover:underline">Terms & Conditions</Link> - Full terms governing use of our services
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
