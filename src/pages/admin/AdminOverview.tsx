import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Users, ShoppingCart, Star, MessageSquare, School, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminOverview() {
  const [stats, setStats] = useState({ users: 0, listings: 0, services: 0, messages: 0, colleges: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.get("/api/admin/stats");
      setStats(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // 30s poll
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    { title: "Total Active Users", value: stats.users, icon: Users, color: "text-blue-500" },
    { title: "Active Listings", value: stats.listings, icon: ShoppingCart, color: "text-green-500" },
    { title: "Peer Services", value: stats.services, icon: Star, color: "text-yellow-500" },
    { title: "Total Messages", value: stats.messages, icon: MessageSquare, color: "text-purple-500" },
    { title: "College Spaces", value: stats.colleges, icon: School, color: "text-pink-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Platform Overview</h1>
        <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="p-6 rounded-2xl border border-border bg-card shadow-soft flex items-start gap-4">
            <div className={`p-3 rounded-xl bg-secondary/50 ${card.color}`}>
              <card.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
              <h3 className="text-3xl font-bold mt-1">{loading ? "..." : card.value}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
