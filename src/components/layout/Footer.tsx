import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Footer() {
  return (
    <footer className="footer-main">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">TruMove</div>
          <div className="footer-tagline">
            AI-powered moving quotes and carrier coordination.
          </div>
        </div>

        <nav className="footer-nav">
          <Link className="footer-link" to="/about">
            About
          </Link>
          <Link className="footer-link" to="/faq">
            FAQ
          </Link>
          <Link className="footer-link" to="/blog">
            Blog
          </Link>
          <Link className="footer-link" to="/privacy">
            Privacy
          </Link>
          <Link className="footer-link" to="/terms">
            Terms
          </Link>
          <Link className="footer-link" to="/sms-consent">
            SMS Policy
          </Link>
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </footer>
  );
}
