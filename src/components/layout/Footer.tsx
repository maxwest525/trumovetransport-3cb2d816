import { Link } from "react-router-dom";

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
          <Link className="footer-link" to="/carrier-vetting">
            Carrier Vetting
          </Link>
          <Link className="footer-link" to="/book">
            Book a consult
          </Link>
          <Link className="footer-link" to="/faq">
            FAQ
          </Link>
          <Link className="footer-link" to="/privacy">
            Privacy
          </Link>
          <Link className="footer-link" to="/terms">
            Terms
          </Link>
          <Link className="footer-link footer-link-muted" to="/classic">
            Classic
          </Link>
        </nav>
      </div>
    </footer>
  );
}
