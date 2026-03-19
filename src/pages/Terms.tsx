import { useEffect } from "react";

import SiteShell from "@/components/layout/SiteShell";

export default function Terms() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <SiteShell>
      
      <div className="max-w-[900px] mx-auto px-6 py-12">
        <h1 className="text-4xl font-black tracking-tight text-foreground mb-2">
          Terms & Conditions
        </h1>
        <p className="text-muted-foreground mb-2">Effective Date: 12/17/2025</p>
        <p className="text-muted-foreground mb-8">Company: TruMove Inc. ("TruMove," "we," "us," "our")</p>

        <div className="prose prose-neutral max-w-none">
          <p className="text-muted-foreground mb-8">
            These Terms & Conditions ("Terms") govern your access to and use of TruMove's websites, landing pages, forms, communications, and services (collectively, the "Services"). By using the Services or submitting information to TruMove, you agree to these Terms. If you do not agree, do not use the Services.
          </p>

          <h2 className="text-xl font-black text-foreground mt-8 mb-4">1. Important Broker Disclosure</h2>
          <p className="text-muted-foreground mb-4">
            TruMove Inc. is a licensed interstate household goods moving broker. We do not transport household goods. We coordinate and arrange transportation services with FMCSA-authorized motor carriers who perform the transportation. You understand and agree that: TruMove is not a motor carrier. TruMove does not provide moving trucks, drivers, or physical transportation. Transportation is arranged and performed by FMCSA-authorized motor carriers, and the motor carrier is responsible for actual transport services.
          </p>

          <h2 className="text-xl font-black text-foreground mt-8 mb-4">2. Estimates, Tariffs, and Pricing</h2>
          <p className="text-muted-foreground mb-4">
            Any estimate provided by TruMove is an estimate based on the information you provide, which may include inventory lists, photos, access conditions, dates, distance, and special handling requirements. Final charges are determined by the motor carrier's published tariff and applicable documents. The carrier's tariff is available for inspection from the carrier upon reasonable request. Pricing may change due to factors including, but not limited to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
            <li>Changes to inventory (added or removed items)</li>
            <li>Packing needs, stairs, elevators, long carries, or access restrictions</li>
            <li>Route changes, dates, delays, storage requirements</li>
            <li>Additional services requested or required</li>
          </ul>
          <p className="text-muted-foreground mb-4">
            Where applicable, carriers may provide binding, non-binding, or guaranteed-not-to-exceed pricing, depending on the carrier, shipment type, and regulations.
          </p>

          <h2 className="text-xl font-black text-foreground mt-8 mb-4">3. Your Responsibilities</h2>
          <p className="text-muted-foreground mb-2">You agree to provide accurate and complete information, including:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
            <li>Inventory details and major items</li>
            <li>Addresses, access conditions, and restrictions</li>
            <li>Requested dates and timing</li>
            <li>Contact details and authorized decision-makers</li>
          </ul>
          <p className="text-muted-foreground mb-4">
            You agree not to misrepresent inventory, access conditions, or any material facts. Inaccurate information can result in changes to pricing, scheduling, and availability.
          </p>

          <h2 className="text-xl font-black text-foreground mt-8 mb-4">4. Booking, Deposits, and Payments</h2>
          <p className="text-muted-foreground mb-4">
            TruMove may assist with booking coordination. Payment terms vary by carrier and may include deposits, partial payments, or payment at pickup/delivery. You acknowledge: TruMove does not set the carrier's tariff or required charges. Payment disputes related to transportation services may be governed by the carrier's documents and applicable law. Any deposit requirements, cancellation policies, and refund rules may be determined by the carrier and/or by the specific agreement you accept at booking.
          </p>

          <h2 className="text-xl font-black text-foreground mt-8 mb-4">5. Cancellations, Rescheduling, and Refunds</h2>
          <p className="text-muted-foreground mb-4">
            Cancellation and rescheduling rules vary depending on the carrier and the specific services scheduled. If you cancel or reschedule:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
            <li>Fees may apply based on carrier policy, dispatch status, and timing.</li>
            <li>Availability for new dates is not guaranteed.</li>
            <li>Refund eligibility, if any, is determined by the applicable booking terms and carrier policies.</li>
          </ul>

          <h2 className="text-xl font-black text-foreground mt-8 mb-4">6. Service Limitations and Disclaimers</h2>
          <p className="text-muted-foreground mb-2">TruMove provides brokerage and coordination services. TruMove does not guarantee:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
            <li>Specific carrier availability on specific dates</li>
            <li>Exact pickup or delivery times</li>
            <li>Exact pricing if shipment details change</li>
            <li>That a carrier will accept a job under all conditions</li>
          </ul>
          <p className="text-muted-foreground mb-2">TruMove is not responsible for carrier actions including:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
            <li>Delays, damages, loss, claims handling, or on-site service performance</li>
            <li>Scheduling changes due to weather, traffic, compliance, mechanical issues, labor constraints, or force majeure events</li>
          </ul>
          <p className="text-muted-foreground mb-4">
            You agree that transportation performance is the responsibility of the motor carrier.
          </p>

          <h2 className="text-xl font-black text-foreground mt-8 mb-4">7. Prohibited Use</h2>
          <p className="text-muted-foreground mb-2">You may not:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
            <li>Use the Services unlawfully</li>
            <li>Submit false information</li>
            <li>Attempt to interfere with the Services, forms, tracking, or security</li>
            <li>Scrape, reverse engineer, or misuse any content or systems</li>
          </ul>

          <h2 className="text-xl font-black text-foreground mt-8 mb-4">8. Intellectual Property</h2>
          <p className="text-muted-foreground mb-4">
            All content on TruMove's website and materials, including branding, design, copy, forms, and systems, is owned by TruMove or licensed to TruMove and protected by applicable laws. You may not copy, reproduce, or redistribute it without written permission.
          </p>

          <h2 className="text-xl font-black text-foreground mt-8 mb-4">9. Limitation of Liability</h2>
          <p className="text-muted-foreground mb-4">
            To the fullest extent permitted by law, TruMove's total liability for any claims arising out of or related to the Services is limited to the amount you paid to TruMove directly (if any) for the specific transaction at issue. TruMove is not liable for indirect, incidental, consequential, or punitive damages, or for damages arising from carrier performance, delays, damages, or loss.
          </p>

          <h2 className="text-xl font-black text-foreground mt-8 mb-4">10. Indemnification</h2>
          <p className="text-muted-foreground mb-4">
            You agree to indemnify and hold harmless TruMove and its officers, employees, and agents from any claims, liabilities, damages, or expenses (including attorneys' fees) arising from your use of the Services, your breach of these Terms, or your violation of any law or third-party rights.
          </p>

          <h2 className="text-xl font-black text-foreground mt-8 mb-4">11. Dispute Resolution and Arbitration</h2>
          <p className="text-muted-foreground mb-4">
            Any dispute arising out of or relating to these Terms or the Services shall be resolved by binding arbitration administered by the American Arbitration Association (AAA) under its Consumer Arbitration Rules. Arbitration will take place in [Insert Location] unless otherwise agreed. You agree to waive any right to participate in a class action lawsuit or class-wide arbitration.
          </p>

          <h2 className="text-xl font-black text-foreground mt-8 mb-4">12. Governing Law</h2>
          <p className="text-muted-foreground mb-4">
            These Terms are governed by the laws of the State of [Insert State], without regard to conflict of law principles.
          </p>

          <h2 className="text-xl font-black text-foreground mt-8 mb-4">13. Changes to Terms</h2>
          <p className="text-muted-foreground mb-4">
            TruMove may update these Terms at any time. Updates become effective when posted with a revised Effective Date. Continued use of the Services after updates constitutes acceptance.
          </p>

          <h2 className="text-xl font-black text-foreground mt-8 mb-4">14. Contact</h2>
          <p className="text-muted-foreground mb-4">
            For questions about these Terms, contact:<br />
            Email: <a href="mailto:legal@trumove.com" className="text-primary hover:underline">legal@trumove.com</a><br />
            Phone: 609-727-7647
          </p>
        </div>
      </div>
    </SiteShell>
  );
}
