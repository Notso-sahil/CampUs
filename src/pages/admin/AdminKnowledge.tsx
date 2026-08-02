import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import { UploadCloud } from "lucide-react";
import { COURSES } from "@/lib/courses"; // Correct import: COURSES is an array of objects from the shared lib

export default function AdminKnowledge() {
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [subCourse, setSubCourse] = useState("");
  const [semester, setSemester] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [saving, setSaving] = useState(false);

  // Derive the sub-courses for the currently selected course from its nested array
  const selectedCourseObj = COURSES.find(c => c.value === course);
  const subCourses = ("subCourses" in (selectedCourseObj ?? {}))
    ? (selectedCourseObj as any).subCourses as string[]
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !course || !semester || !file) {
      toast({ title: "Error", description: "Title, course, semester, and file are required.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      // uploadToCloudinary returns a plain string (the public URL), not an object
      const fileUrl = await uploadToCloudinary(file, "knowledge-hub");
      
      await api.post("/api/knowledge-hub", {
        title,
        file_url: fileUrl,
        course,
        sub_course: subCourse || null,
        semester: parseInt(semester)
      });
      
      toast({ title: "Resource uploaded successfully!" });
      
      setTitle("");
      setFile(null);
      // Keep course/subcourse/sem selected for rapid uploads
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.error || "Failed to upload", variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">Knowledge Hub Uploads</h1>

      <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <UploadCloud className="h-5 w-5 text-primary" /> Direct Admin Upload
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label>Resource Title</Label>
            <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Operating Systems Notes Unit 1" className="bg-secondary/50" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Course</Label>
              <Select value={course} onValueChange={(val) => { setCourse(val); setSubCourse(""); }}>
                <SelectTrigger className="bg-secondary/50"><SelectValue placeholder="Select Course" /></SelectTrigger>
                <SelectContent>
                  {/* COURSES is an array of { value, label } objects */}
                  {COURSES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <Label>Sub-Course <span className="text-muted-foreground text-xs">(if applicable)</span></Label>
              <Select value={subCourse} onValueChange={setSubCourse} disabled={!course || subCourses.length === 0}>
                <SelectTrigger className="bg-secondary/50"><SelectValue placeholder={subCourses.length === 0 ? "N/A for this course" : "Select Specialization"} /></SelectTrigger>
                <SelectContent>
                  {/* subCourses is derived from the nested subCourses array inside the selected course */}
                  {subCourses.map(sc => (
                    <SelectItem key={sc} value={sc}>{sc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <Label>Semester</Label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger className="bg-secondary/50"><SelectValue placeholder="Semester" /></SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6,7,8].map(s => <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>PDF / Document File</Label>
            <Input required type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="bg-secondary/50" />
          </div>

          <Button type="submit" className="w-full mt-2" disabled={saving}>
            {saving ? "Uploading..." : "Upload to Knowledge Hub"}
          </Button>
        </form>
      </div>
    </div>
  );
}
