import { useState, useEffect } from "react";

// Scroll to top on mount
const useScrollToTop = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Carrier Vetting: Ensuring Safe Moving Services | TruMove";
  }, []);
};
import { Link } from "react-router-dom";
import SiteShell from "@/components/layout/SiteShell";
import { 
  Shield, CheckCircle2, Search, ExternalLink, 
  Star, Truck, FileCheck, Activity, BadgeCheck, Eye, 
  Settings, Home, Users, MapPin, Lock, Bell,
  ChevronRight, TrendingUp, AlertTriangle, XCircle,
  Filter, Download, MoreHorizontal
} from "lucide-react";

// Sample carrier data
const SAMPLE_CARRIERS = [
  { id: 1, name: "Swift Family Movers", usdot: "1847293", mc: "MC-847291", status: "Verified", score: "A+", location: "Miami, FL", onTime: "98.2%", claims: 0 },
  { id: 2, name: "Heartland Van Lines", usdot: "2938471", mc: "MC-293847", status: "Verified", score: "A", location: "Dallas, TX", onTime: "96.8%", claims: 1 },
  { id: 3, name: "Coastal Moving Co", usdot: "3847291", mc: "MC-384729", status: "Pending", score: "B+", location: "Seattle, WA", onTime: "94.1%", claims: 2 },
  { id: 4, name: "Mountain Express", usdot: "4928374", mc: "MC-492837", status: "Verified", score: "A", location: "Denver, CO", onTime: "97.5%", claims: 0 },
  { id: 5, name: "Liberty Logistics", usdot: "5839274", mc: "MC-583927", status: "Review", score: "B", location: "Chicago, IL", onTime: "91.3%", claims: 3 },
];

const RECENT_ACTIVITY = [
  { type: "verified", carrier: "Swift Family Movers", time: "2 hours ago" },
  { type: "rejected", carrier: "QuickMove LLC", time: "5 hours ago" },
  { type: "monitoring", carrier: "Heartland Van Lines", time: "1 day ago" },
  { type: "verified", carrier: "Mountain Express", time: "2 days ago" },
];

export default function VettingDashboard() {
  useScrollToTop();
  const [activeTab, setActiveTab] = useState("carriers");
  const [searchQuery, setSearchQuery] = useState("");

  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "carriers", icon: Truck, label: "Carriers" },
    { id: "vetting", icon: Shield, label: "Vetting" },
    { id: "monitoring", icon: Activity, label: "Monitoring" },
    { id: "locations", icon: MapPin, label: "Locations" },
    { id: "users", icon: Users, label: "Users" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <SiteShell>
      <div className="tru-dashboard">
        {/* Sidebar */}
        <aside className="tru-dashboard-sidebar">
          <div className="tru-dashboard-sidebar-logo">
            <Shield className="w-6 h-6" />
            <span>TruVet</span>
          </div>
          
          <nav className="tru-dashboard-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`tru-dashboard-nav-item ${activeTab === item.id ? 'active' : ''}`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="tru-dashboard-sidebar-footer">
            <button className="tru-dashboard-nav-item">
              <Bell className="w-5 h-5" />
              <span>Alerts</span>
              <span className="tru-dashboard-badge">3</span>
            </button>
            <button className="tru-dashboard-nav-item">
              <Lock className="w-5 h-5" />
              <span>Security</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="tru-dashboard-main">
          {/* Header */}
          <header className="tru-dashboard-header">
            <div className="tru-dashboard-header-left">
              <h1 className="tru-dashboard-title">Carrier Vetting</h1>
              <span className="tru-dashboard-subtitle">Monitor and verify all carriers</span>
            </div>
            <div className="tru-dashboard-header-right">
              <div className="tru-dashboard-search">
                <Search className="w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search carriers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="tru-dashboard-icon-btn">
                <Filter className="w-4 h-4" />
              </button>
              <button className="tru-dashboard-icon-btn">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Stats Row */}
          <div className="tru-dashboard-stats">
            <div className="tru-dashboard-stat-card">
              <div className="tru-dashboard-stat-icon tru-stat-success">
                <BadgeCheck className="w-5 h-5" />
              </div>
              <div className="tru-dashboard-stat-content">
                <span className="tru-dashboard-stat-value">847</span>
                <span className="tru-dashboard-stat-label">Carriers Vetted</span>
              </div>
            </div>
            
            <div className="tru-dashboard-stat-card">
              <div className="tru-dashboard-stat-icon tru-stat-danger">
                <XCircle className="w-5 h-5" />
              </div>
              <div className="tru-dashboard-stat-content">
                <span className="tru-dashboard-stat-value">312</span>
                <span className="tru-dashboard-stat-label">Rejected</span>
              </div>
            </div>
            
            <div className="tru-dashboard-stat-card">
              <div className="tru-dashboard-stat-icon tru-stat-warning">
                <Eye className="w-5 h-5" />
              </div>
              <div className="tru-dashboard-stat-content">
                <span className="tru-dashboard-stat-value">23</span>
                <span className="tru-dashboard-stat-label">Under Review</span>
              </div>
            </div>
            
            <div className="tru-dashboard-stat-card">
              <div className="tru-dashboard-stat-icon tru-stat-info">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="tru-dashboard-stat-content">
                <span className="tru-dashboard-stat-value">98.2%</span>
                <span className="tru-dashboard-stat-label">Avg On-Time</span>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="tru-dashboard-grid">
            {/* Carrier Table */}
            <div className="tru-dashboard-card tru-dashboard-table-card">
              <div className="tru-dashboard-card-header">
                <h2>Active Carriers</h2>
                <button className="tru-dashboard-text-btn">
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="tru-dashboard-table-wrap">
                <table className="tru-dashboard-table">
                  <thead>
                    <tr>
                      <th>Carrier</th>
                      <th>USDOT</th>
                      <th>Status</th>
                      <th>Score</th>
                      <th>On-Time</th>
                      <th>Claims</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {SAMPLE_CARRIERS.map((carrier) => (
                      <tr key={carrier.id}>
                        <td>
                          <div className="tru-dashboard-carrier-cell">
                            <span className="tru-dashboard-carrier-name">{carrier.name}</span>
                            <span className="tru-dashboard-carrier-location">{carrier.location}</span>
                          </div>
                        </td>
                        <td><span className="tru-dashboard-mono">{carrier.usdot}</span></td>
                        <td>
                          <span className={`tru-dashboard-status tru-status-${carrier.status.toLowerCase()}`}>
                            {carrier.status}
                          </span>
                        </td>
                        <td>
                          <span className={`tru-dashboard-score tru-score-${carrier.score.replace('+', 'plus')}`}>
                            {carrier.score}
                          </span>
                        </td>
                        <td><span className="tru-dashboard-highlight">{carrier.onTime}</span></td>
                        <td><span className={carrier.claims > 0 ? 'tru-dashboard-warning' : ''}>{carrier.claims}</span></td>
                        <td>
                          <button className="tru-dashboard-row-btn">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sidebar Cards */}
            <div className="tru-dashboard-side-column">
              {/* Verification Status */}
              <div className="tru-dashboard-card tru-dashboard-verification-card">
                <div className="tru-dashboard-verification-header">
                  <div className="tru-dashboard-verification-icon">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3>USDOT Verified</h3>
                    <span>Active • No violations</span>
                  </div>
                </div>
                
                <div className="tru-dashboard-verification-header">
                  <div className="tru-dashboard-verification-icon">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3>Insurance Active</h3>
                    <span>$1M Cargo • $750K Liability</span>
                  </div>
                </div>
                
                <div className="tru-dashboard-verification-header tru-verification-warning">
                  <div className="tru-dashboard-verification-icon tru-icon-warning">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <h3>Live Monitoring</h3>
                    <span>98.2% on-time rate</span>
                  </div>
                </div>
              </div>

              {/* TruMove Score */}
              <div className="tru-dashboard-card tru-dashboard-score-card">
                <div className="tru-dashboard-score-ring">
                  <span>A+</span>
                </div>
                <div className="tru-dashboard-score-info">
                  <h3>TruMove Score</h3>
                  <span>Top 5% of carriers</span>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="tru-dashboard-card">
                <div className="tru-dashboard-card-header">
                  <h2>Recent Activity</h2>
                </div>
                <div className="tru-dashboard-activity-list">
                  {RECENT_ACTIVITY.map((activity, i) => (
                    <div key={i} className="tru-dashboard-activity-item">
                      <div className={`tru-dashboard-activity-dot tru-dot-${activity.type}`} />
                      <div className="tru-dashboard-activity-content">
                        <span className="tru-dashboard-activity-carrier">{activity.carrier}</span>
                        <span className="tru-dashboard-activity-type">{activity.type}</span>
                      </div>
                      <span className="tru-dashboard-activity-time">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Floating Badges - Demo */}
        <div className="tru-dashboard-float-badges">
          <div className="tru-dashboard-float-badge tru-float-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>USDOT Verified</span>
          </div>
          <div className="tru-dashboard-float-badge tru-float-2">
            <Shield className="w-4 h-4" />
            <span>Insurance Active</span>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
