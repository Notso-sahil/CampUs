import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import { useAuthContext } from "@/contexts/AuthContext";

interface RequestUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSection: "events" | "featured" | "knowledge";
}

export default function RequestUploadModal({ isOpen, onClose, targetSection }: RequestUploadModalProps) {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    contact_no: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    
    try {
      let image_url = null;
      if (file) {
        image_url = await uploadToCloudinary(file, "requests");
      }

      await api.post("/api/upload-requests", {
        user_id: user.id,
        target_section: targetSection,
        title: form.title.trim(),
        description: form.description.trim(),
        contact_no: form.contact_no.trim() || null,
        image_url,
      });

      toast({ title: "Request submitted", description: "An admin will review your request." });
      setForm({ title: "", description: "", contact_no: "" });
      setFile(null);
      onClose();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to submit request.", variant: "destructive" });
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Request to Upload</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input 
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Annual Hackathon"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Description *</Label>
            <Textarea 
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Full details of the event or item..."
              required
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Contact No. (Optional)</Label>
            <Input 
              value={form.contact_no}
              onChange={(e) => setForm({ ...form, contact_no: e.target.value })}
              placeholder="So admins can reach you"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Image Attachment (Optional)</Label>
            <Input 
              type="file" 
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
