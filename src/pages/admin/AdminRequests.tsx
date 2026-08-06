import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Inbox, MessageSquare, Check, X } from "lucide-react";
import { format } from "date-fns";

export default function AdminRequests() {
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'requests' | 'feedback'>('requests');
  
  const [requests, setRequests] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqs, fb] = await Promise.all([
        api.get("/api/upload-requests"),
        api.get("/api/admin-feedback")
      ]);
      setRequests(Array.isArray(reqs) ? reqs : reqs.data || []);
      setFeedback(Array.isArray(fb) ? fb : fb.data || []);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to fetch data", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequestAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.put(`/api/upload-requests`, { id, status, reviewed_by: "Admin" });
      toast({ title: `Request ${status} successfully` });
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: "Failed to update request", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Inbox className="h-8 w-8 text-primary" /> Inbox & Requests
      </h1>

      <div className="flex gap-4 border-b border-border pb-2">
        <button 
          onClick={() => setActiveTab('requests')} 
          className={`font-medium pb-2 border-b-2 transition-colors ${activeTab === 'requests' ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'}`}
        >
          Upload Requests
        </button>
        <button 
          onClick={() => setActiveTab('feedback')} 
          className={`font-medium pb-2 border-b-2 transition-colors ${activeTab === 'feedback' ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'}`}
        >
          User Feedback
        </button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : activeTab === 'requests' ? (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <p className="text-muted-foreground">No upload requests found.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {requests.map(req => (
                <div key={req.id} className="p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground uppercase">
                        {req.target_section}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                        req.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                        'bg-red-500/20 text-red-500'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg">{req.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{req.description}</p>
                    <p className="text-xs text-muted-foreground mt-3">
                      Requested on: {format(new Date(req.created_at), 'PPP')}
                    </p>
                  </div>
                  
                  {req.status === 'pending' && (
                    <div className="flex items-center gap-2 sm:self-start">
                      <Button size="sm" onClick={() => handleRequestAction(req.id, 'approved')} className="bg-green-500 hover:bg-green-600 text-white">
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleRequestAction(req.id, 'rejected')}>
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.length === 0 ? (
            <p className="text-muted-foreground">No feedback received yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedback.map(fb => (
                <div key={fb.id} className="p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="font-medium">{fb.email}</p>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(fb.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <p className="text-sm mt-2 text-foreground/90 whitespace-pre-wrap">{fb.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
