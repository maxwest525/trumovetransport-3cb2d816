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
          <Link className="footer-link" to="/site/about">
            About
          </Link>
          <Link className="footer-link" to="/site/faq">
            FAQ
          </Link>
          <Link className="footer-link" to="/site/privacy">
            Privacy
          </Link>
          <Link className="footer-link" to="/site/terms">
            Terms
          </Link>
          <Link className="footer-link footer-link-muted" to="/">
            Portal
          </Link>
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </footer>
  );
}
