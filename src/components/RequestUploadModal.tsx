import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import { useAuthContext } from "@/contexts/AuthContext";
import { COURSES } from "@/lib/courses";

interface RequestUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSection: "events" | "featured" | "knowledge";
  collegeName: string;
}

export default function RequestUploadModal({ isOpen, onClose, targetSection, collegeName }: RequestUploadModalProps) {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Generic fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contactNo, setContactNo] = useState("");
  
  // Events/Featured fields
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Knowledge Hub fields
  const [fileData, setFileData] = useState<File | null>(null);
  const [course, setCourse] = useState("");
  const [subCourse, setSubCourse] = useState("");
  const [semester, setSemester] = useState("");

  const selectedCourseObj = COURSES.find(c => c.value === course);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (targetSection === "featured" && !imageFile) {
      toast({ title: "Error", description: "Image is required for Featured items.", variant: "destructive" });
      return;
    }

    setLoading(true);
    
    try {
      let image_url = null;
      if (imageFile) {
        image_url = await uploadToCloudinary(imageFile, "requests");
      }

      let file_url = null;
      if (fileData) {
        file_url = await uploadToCloudinary(fileData, "knowledge");
      }

      const metadata = {
        event_date: eventDate || null,
        location: location || null,
        course: course || null,
        sub_course: subCourse || null,
        semester: semester || null,
        file_url: file_url || null,
        college_name: collegeName || null,
      };

      await api.post("/api/upload-requests", {
        user_id: user.id,
        target_section: targetSection,
        title: title.trim(),
        description: description.trim(),
        contact_no: contactNo.trim() || null,
        image_url,
        metadata
      });

      toast({ title: "Request submitted", description: "An admin will review your request." });
      
      // Reset
      setTitle(""); setDescription(""); setContactNo("");
      setEventDate(""); setLocation(""); setImageFile(null);
      setFileData(null); setCourse(""); setSubCourse(""); setSemester("");
      
      onClose();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to submit request.", variant: "destructive" });
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Request to Upload</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Annual Hackathon"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Description *</Label>
            <Textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Full details..."
              required
              className="min-h-[100px]"
            />
          </div>

          {/* EVENTS & FEATURED */}
          {(targetSection === "events" || targetSection === "featured") && (
            <>
              <div className="space-y-1.5">
                <Label>Event Date {targetSection === "events" ? "*" : "(Optional)"}</Label>
                <Input 
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required={targetSection === "events"}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Location {targetSection === "events" ? "*" : "(Optional)"}</Label>
                <Input 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Main Auditorium"
                  required={targetSection === "events"}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Image {targetSection === "featured" ? "*" : "(Optional)"}</Label>
                <Input 
                  type="file" 
                  accept=".jpg,.jpeg,.png,.heic"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  required={targetSection === "featured"}
                />
              </div>
            </>
          )}

          {/* KNOWLEDGE HUB */}
          {targetSection === "knowledge" && (
            <>
              <div className="space-y-1.5">
                <Label>Course *</Label>
                <Select value={course} onValueChange={setCourse} required>
                  <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>
                    {COURSES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {selectedCourseObj && "subCourses" in selectedCourseObj && selectedCourseObj.subCourses.length > 0 && (
                <div className="space-y-1.5">
                  <Label>Branch / Specialization *</Label>
                  <Select value={subCourse} onValueChange={setSubCourse} required>
                    <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                    <SelectContent>
                      {selectedCourseObj.subCourses.map((b: string) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Semester *</Label>
                <Select value={semester} onValueChange={setSemester} required>
                  <SelectTrigger><SelectValue placeholder="Select semester" /></SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 8}, (_, i) => (
                      <SelectItem key={i+1} value={(i+1).toString()}>Semester {i+1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>File Upload (PDF/Doc) *</Label>
                <Input 
                  type="file" 
                  onChange={(e) => setFileData(e.target.files?.[0] || null)}
                  required
                />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label>Contact No. (Optional)</Label>
            <Input 
              value={contactNo}
              onChange={(e) => setContactNo(e.target.value)}
              placeholder="So admins can reach you"
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
