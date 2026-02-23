import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Calendar, MapPin, Phone, Mail, Clock, AlertCircle, CheckCircle2, Package, Sparkles, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface Job {
  id: string;
  customer: string;
  phone: string;
  from: string;
  to: string;
  date: string;
  time: string;
  status: "upcoming" | "today" | "in-progress" | "completed" | "needs-followup";
  weight: string;
  crew: number;
  notes?: string;
  followupReason?: string;
}

const DEMO_JOBS: Job[] = [
  {
    id: "TM-2026-001",
    customer: "Sarah Johnson",
    phone: "(555) 123-4567",
    from: "1234 Oak Street, Tampa, FL",
    to: "789 Pine Avenue, Orlando, FL",
    date: "2026-02-03",
    time: "8:00 AM",
    status: "today",
    weight: "4,250 lbs",
    crew: 3,
    notes: "Piano on 2nd floor, requires special equipment",
  },
  {
    id: "TM-2026-002",
    customer: "Michael Chen",
    phone: "(555) 987-6543",
    from: "456 Palm Ave, Miami, FL",
    to: "321 Beach Rd, Fort Lauderdale, FL",
    date: "2026-02-03",
    time: "1:00 PM",
    status: "today",
    weight: "2,800 lbs",
    crew: 2,
  },
  {
    id: "TM-2026-003",
    customer: "Emily Rodriguez",
    phone: "(555) 456-7890",
    from: "789 Sunset Blvd, Orlando, FL",
    to: "555 River Walk, Jacksonville, FL",
    date: "2026-02-05",
    time: "9:00 AM",
    status: "upcoming",
    weight: "5,100 lbs",
    crew: 4,
    notes: "Long distance - 2 day move",
  },
  {
    id: "TM-2026-004",
    customer: "David Kim",
    phone: "(555) 222-3333",
    from: "100 Main St, Gainesville, FL",
    to: "200 College Ave, Tallahassee, FL",
    date: "2026-02-07",
    time: "7:30 AM",
    status: "upcoming",
    weight: "3,600 lbs",
    crew: 3,
  },
  {
    id: "TM-2026-005",
    customer: "Lisa Thompson",
    phone: "(555) 444-5555",
    from: "50 Harbor View, Clearwater, FL",
    to: "75 Gulf Blvd, St. Petersburg, FL",
    date: "2026-01-30",
    time: "10:00 AM",
    status: "needs-followup",
    weight: "2,200 lbs",
    crew: 2,
    followupReason: "Customer reported damaged mirror - needs claim form",
  },
  {
    id: "TM-2026-006",
    customer: "Robert Garcia",
    phone: "(555) 666-7777",
    from: "300 Industrial Pkwy, Tampa, FL",
    to: "400 Commerce Dr, Brandon, FL",
    date: "2026-01-28",
    time: "8:00 AM",
    status: "completed",
    weight: "8,500 lbs",
    crew: 5,
  },
];

export function CarrierDashboard({ onCallCarrier }: { onCallCarrier?: (number?: string) => void }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeTab, setActiveTab] = useState("today");

  const loadDemo = () => {
    setJobs(DEMO_JOBS);
    toast.success("Demo jobs loaded");
  };

  const getStatusBadge = (status: Job["status"]) => {
    switch (status) {
      case "today":
        return <Badge className="bg-primary/10 text-primary border-primary/30">Today</Badge>;
      case "upcoming":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30">Upcoming</Badge>;
      case "in-progress":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">Completed</Badge>;
      case "needs-followup":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/30">Needs Follow-up</Badge>;
      default:
        return null;
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (activeTab === "today") return job.status === "today" || job.status === "in-progress";
    if (activeTab === "upcoming") return job.status === "upcoming";
    if (activeTab === "followup") return job.status === "needs-followup";
    if (activeTab === "completed") return job.status === "completed";
    return true;
  });

  const todayCount = jobs.filter((j) => j.status === "today" || j.status === "in-progress").length;
  const upcomingCount = jobs.filter((j) => j.status === "upcoming").length;
  const followupCount = jobs.filter((j) => j.status === "needs-followup").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Truck className="w-6 h-6" />
          Carrier Dashboard
        </h2>
        <Button onClick={loadDemo} variant="outline" size="sm" className="gap-2">
          <Sparkles className="w-4 h-4" />
          Load Demo Jobs
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-primary">{todayCount}</div>
            <p className="text-sm text-muted-foreground">Today's Jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-blue-500">{upcomingCount}</div>
            <p className="text-sm text-muted-foreground">Upcoming</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-red-500">{followupCount}</div>
            <p className="text-sm text-muted-foreground">Need Follow-up</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-emerald-500">{jobs.filter((j) => j.status === "completed").length}</div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today" className="gap-2">
            Today {todayCount > 0 && <Badge variant="secondary">{todayCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="followup" className="gap-2">
            Follow-up {followupCount > 0 && <Badge variant="destructive">{followupCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {jobs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Load demo data to see scheduled jobs</p>
              </CardContent>
            </Card>
          ) : filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No jobs in this category</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-medium bg-muted px-2 py-1 rounded">
                            {job.id}
                          </span>
                          {getStatusBadge(job.status)}
                        </div>

                        <div className="flex items-center gap-4">
                          <h3 className="font-semibold text-lg">{job.customer}</h3>
                          <a href={`tel:${job.phone}`} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            {job.phone}
                          </a>
                        </div>

                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-emerald-500 mt-0.5" />
                          <div>
                            <span className="text-muted-foreground">From:</span> {job.from}
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
                          <div>
                            <span className="text-muted-foreground">To:</span> {job.to}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {job.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {job.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {job.weight}
                          </span>
                          <span>{job.crew} crew</span>
                        </div>

                        {job.notes && (
                          <div className="text-sm p-2 rounded bg-muted/50 border-l-2 border-primary">
                            📝 {job.notes}
                          </div>
                        )}

                        {job.followupReason && (
                          <div className="text-sm p-2 rounded bg-red-500/10 border-l-2 border-red-500 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            {job.followupReason}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="outline" className="gap-1 border-foreground/20 hover:bg-foreground hover:text-background">
                          <ChevronRight className="w-4 h-4" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => onCallCarrier?.(job.phone)}>
                          <Phone className="w-4 h-4" />
                          Call
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1">
                          <Mail className="w-4 h-4" />
                          Email
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
