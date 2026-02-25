import { MapPin, TrendingUp, Headphones, Star, Shield, Award } from "lucide-react";

const STATS = [
{ icon: MapPin, text: "SERVING 48 STATES" },
{ icon: TrendingUp, text: "50,000+ MOVES COMPLETED" },
{ icon: Headphones, text: "24/7 SUPPORT" },
{ icon: Star, text: "4.9★ CUSTOMER RATING" },
{ icon: Shield, text: "LICENSED & INSURED" },
{ icon: Award, text: "A+ BBB RATING" }];


export default function StatsStrip() {
  return (
    <div className="stats-strip">
      <div className="stats-strip-inner">
        {STATS.map((stat, idx) =>
        <div key={stat.text} className="stats-strip-item">
            
            <span>{stat.text}</span>
            {idx < STATS.length - 1 &&
          <span className="stats-strip-dot">•</span>
          }
          </div>
        )}
      </div>
    </div>);

}