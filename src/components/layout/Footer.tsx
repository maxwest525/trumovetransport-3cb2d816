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
          <Link className="footer-link" to="/site/about">
            About
          </Link>
          <Link className="footer-link" to="/site/carrier-vetting">
            Carrier Vetting
          </Link>
          <Link className="footer-link" to="/site/book">
            Book a consult
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
        </nav>
      </div>
    </footer>
  );
}
