import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCollege } from "@/contexts/CollegeContext";
import { COURSES } from "@/lib/courses";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RequestUploadModal from "@/components/RequestUploadModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { uploadToStorage } from "@/lib/uploadToStorage";
import { Download, Upload, Send, FileText, Lock } from "lucide-react";

import { DUMMY_NOTES, mergeWithDummies } from "@/lib/dummyData";
import { DUMMY_MSG } from "@/lib/dummyMessages";

interface KnowledgeItem {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  course: string;
  sub_course: string | null;
  semester: string | null;
  college_name: string | null;
  created_at: string;
  isDummy?: boolean;
}

export default function KnowledgeHub() {
  const { user, isAdmin } = useAuthContext();
  const { browseCollege, userCollege } = useCollege();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedSubCourse, setSelectedSubCourse] = useState<string>("all");
  const [showUpload, setShowUpload] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Admin upload form
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadCourse, setUploadCourse] = useState("");
  const [uploadSubCourse, setUploadSubCourse] = useState("");
  const [uploadSemester, setUploadSemester] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const currentCourseObj = COURSES.find((c) => c.value === selectedCourse);
  const hasSubCourses = currentCourseObj && "subCourses" in currentCourseObj;

  const fetchItems = async () => {
    setLoading(true);
    try {
      const resp = await api.get(`/api/knowledge-hub?college_name=${encodeURIComponent(browseCollege)}`);
      let arr: KnowledgeItem[] = Array.isArray(resp) ? resp : (Array.isArray(resp?.data) ? resp.data : []);
      
      let filtered = [...arr];
      if (selectedCourse !== "all") filtered = filtered.filter(k => k.course === selectedCourse);
      if (selectedSubCourse !== "all") filtered = filtered.filter(k => k.sub_course === selectedSubCourse);

      setItems(mergeWithDummies(filtered, DUMMY_NOTES as KnowledgeItem[], 100));
    } catch (err) {
      console.error("Failed to fetch knowledge hub items", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedCourse, selectedSubCourse, browseCollege]);

  const handleDownload = (item: KnowledgeItem) => {
    if (item.isDummy) {
      toast({ title: DUMMY_MSG.download, variant: "destructive" });
      return;
    }
    if (!user) {
      navigate("/auth");
      return;
    }
    if (item.file_url) {
      window.open(item.file_url, "_blank");
    } else {
      toast({ title: "No file", description: "No file attached to this material." });
    }
  };

  const handleRequestUpload = async () => {
    if (!user) { navigate("/auth"); return; }
    setShowRequestModal(true);
  };

  const handleAdminUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !user) return;
    setUploading(true);
    try {
      let fileUrl: string | null = null;
      if (uploadFile) {
        fileUrl = await uploadToStorage(uploadFile, "knowledge_hub");
      }

      await api.post("/api/knowledge-hub", {
        title: uploadTitle,
        description: uploadDesc || null,
        file_url: fileUrl,
        course: uploadCourse,
        sub_course: uploadSubCourse || null,
        semester: uploadSemester || null,
        created_by: user.id,
        college_name: browseCollege,
      });
      toast({ title: "Material uploaded!" });
      setShowUpload(false);
      setUploadTitle(""); setUploadDesc(""); setUploadCourse(""); setUploadSubCourse(""); setUploadSemester(""); setUploadFile(null);
      fetchItems();
    } catch {
      toast({ title: "Error", description: "Upload failed. Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold">Knowledge Hub</h1>
          <div className="flex gap-2">
            {isAdmin && (
              <Button size="sm" onClick={() => setShowUpload(!showUpload)} className="gap-2">
                <Upload className="h-4 w-4" /> Upload
              </Button>
            )}
            {!isAdmin && user && (
              userCollege === browseCollege ? (
                <Button variant="outline" size="sm" onClick={handleRequestUpload} className="gap-2">
                  <Send className="h-4 w-4" /> Request to Upload
                </Button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button disabled variant="outline" size="sm" className="gap-2 opacity-50">
                        <Send className="h-4 w-4" /> Request to Upload
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Switch back to {userCollege} to request uploads</p>
                  </TooltipContent>
                </Tooltip>
              )
            )}
          </div>
        </div>

        {/* Admin Upload Form */}
        {showUpload && isAdmin && (
          <div className="mb-8 rounded-lg border border-border bg-card p-6 animate-fade-in">
            <h2 className="font-display text-xl font-semibold mb-4">Upload Material</h2>
            <form onSubmit={handleAdminUpload} className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input required value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} maxLength={150} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={uploadDesc} onChange={(e) => setUploadDesc(e.target.value)} maxLength={2000} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Course *</Label>
                  <Select value={uploadCourse} onValueChange={setUploadCourse}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {COURSES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {COURSES.find((c) => c.value === uploadCourse && "subCourses" in c) && (
                  <div className="space-y-2">
                    <Label>Sub-Course</Label>
                    <Select value={uploadSubCourse} onValueChange={setUploadSubCourse}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {(COURSES.find((c) => c.value === uploadCourse) as any)?.subCourses?.map((sc: string) => (
                          <SelectItem key={sc} value={sc}>{sc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Semester</Label>
                  <Input value={uploadSemester} onChange={(e) => setUploadSemester(e.target.value)} placeholder="e.g., Semester 3" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>File</Label>
                <Input type="file" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
              </div>
              <Button type="submit" disabled={uploading || !uploadCourse || !uploadTitle}>
                {uploading ? "Uploading..." : "Upload Material"}
              </Button>
            </form>
          </div>
        )}

        {/* Course Navigation */}
        <div className="mb-6 space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => { setSelectedCourse("all"); setSelectedSubCourse("all"); }}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedCourse === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              All
            </button>
            {COURSES.map((course) => (
              <button
                key={course.value}
                onClick={() => { setSelectedCourse(course.value); setSelectedSubCourse("all"); }}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCourse === course.value ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {course.label}
              </button>
            ))}
          </div>

          {hasSubCourses && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedSubCourse("all")}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedSubCourse === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                All Branches
              </button>
              {(currentCourseObj as any).subCourses.map((sc: string) => (
                <button
                  key={sc}
                  onClick={() => setSelectedSubCourse(sc)}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedSubCourse === sc ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"
                  }`}
                >
                  {sc}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Items */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">No materials found</p>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {items.map((item) => (
              <div key={item.id} className="relative flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm">
                {item.isDummy && (
                  <span className="absolute top-3 right-4 z-10 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 border border-amber-300">
                    Demo Entry
                  </span>
                )}
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {item.course}{item.sub_course ? ` · ${item.sub_course}` : ""}{item.semester ? ` · ${item.semester}` : ""}
                  </p>
                </div>
                {user ? (
                  <Button variant="ghost" size="sm" onClick={() => handleDownload(item)} className="gap-1 flex-shrink-0">
                    <Download className="h-4 w-4" /> Download
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="gap-1 flex-shrink-0 text-muted-foreground">
                    <Lock className="h-4 w-4" /> Login to Download
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <RequestUploadModal 
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        targetSection="knowledge"
        collegeName={browseCollege || ""}
      />

      <Footer />
    </div>
  );
}
