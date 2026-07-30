import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCollege } from "@/contexts/CollegeContext";
import Navbar from "@/components/Navbar";
import FadeIn from "@/components/FadeIn";
import PageSpinner from "@/components/PageSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Home, Plus, Search, MapPin, DollarSign, Users, Crown, LogOut, MessageCircle, UserPlus, Info } from "lucide-react";

interface RoommateListing {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  location_details: string;
  rent_per_head: string;
  gender_preference: string;
  roommates_needed: number;
  roommates_found: number;
  college_name: string | null;
  is_full: boolean;
  created_at: string;
}

interface RoommateMember {
  id: string;
  listing_id: string;
  user_id: string;
  status: string;
  message: string | null;
  joined_at: string;
}

type View = "browse" | "create" | "my-room";

export default function FindRoommate() {
  const { user } = useAuthContext();
  const { selectedCollege } = useCollege();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [view, setView] = useState<View>("browse");
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<RoommateListing[]>([]);
  const [myListing, setMyListing] = useState<RoommateListing | null>(null);
  const [myMembers, setMyMembers] = useState<RoommateMember[]>([]);
  
  // Search & Filters
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");
  const [hideFullRooms, setHideFullRooms] = useState(false);
  
  // Create form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationDetails, setLocationDetails] = useState("");
  const [rentPerHead, setRentPerHead] = useState("");
  const [genderPref, setGenderPref] = useState("Any");
  const [roommatesNeeded, setRoommatesNeeded] = useState("2");
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get all listings for the college
      const allListings = await api.get(`/api/roommate-listings${selectedCollege ? `?college_name=${encodeURIComponent(selectedCollege)}` : ''}`);
      setListings((allListings as RoommateListing[]) || []);

      if (user) {
        // Check if user is a member of any listing
        const membersData = await api.get(`/api/roommate-members?user_id=${user.id}`);
        const membership = (membersData as RoommateMember[])?.[0]; // Assume user can only be in one room at a time for simplicity

        if (membership) {
          const listingData = await api.get(`/api/roommate-listings?id=${membership.listing_id}`);
          const listing = listingData as RoommateListing;
          setMyListing(listing);

          if (listing) {
            const members = await api.get(`/api/roommate-members?listing_id=${listing.id}`);
            setMyMembers((members as RoommateMember[]) || []);
            setView("my-room");
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user, selectedCollege]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCreating(true);
    try {
      const newListing = await api.post("/api/roommate-listings", {
        creator_id: user.id,
        title: title.trim(),
        description: description.trim(),
        location_details: locationDetails.trim(),
        rent_per_head: rentPerHead.trim(),
        gender_preference: genderPref,
        roommates_needed: parseInt(roommatesNeeded, 10),
        college_name: selectedCollege,
      });

      // Automatically add creator as an approved member
      await api.post("/api/roommate-members", {
        listing_id: newListing.id,
        user_id: user.id,
      });
      // Update creator status to approved (since default is pending)
      const membersData = await api.get(`/api/roommate-members?listing_id=${newListing.id}`);
      const creatorMember = (membersData as RoommateMember[]).find(m => m.user_id === user.id);
      if (creatorMember) {
         await api.put("/api/roommate-members", { id: creatorMember.id, status: "approved" });
      }

      toast({ title: "Roommate request posted!" });
      await fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to create listing", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleRequestJoin = async (listingId: string) => {
    if (!user) return;
    try {
      await api.post("/api/roommate-members", {
        listing_id: listingId,
        user_id: user.id,
        message: "I am interested in being your roommate!",
      });
      toast({ title: "Join request sent!" });
      await fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to send request", variant: "destructive" });
    }
  };

  const handleAcceptRequest = async (member: RoommateMember) => {
    if (!myListing) return;
    try {
      await api.put("/api/roommate-members", { id: member.id, status: "approved" });
      
      // Increment roommates_found
      const newFoundCount = myListing.roommates_found + 1;
      const isFull = newFoundCount >= myListing.roommates_needed;
      
      await api.put("/api/roommate-listings", { 
        id: myListing.id, 
        roommates_found: newFoundCount,
        is_full: isFull 
      });
      
      toast({ title: "Roommate accepted!" });
      await fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to accept", variant: "destructive" });
    }
  };

  const handleRejectRequest = async (memberId: string) => {
    try {
      await api.put("/api/roommate-members", { id: memberId, status: "rejected" });
      toast({ title: "Request rejected" });
      await fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to reject", variant: "destructive" });
    }
  };

  const handleRemoveMember = async (member: RoommateMember) => {
    if (!myListing) return;
    try {
      await api.delete(`/api/roommate-members?id=${member.id}`);
      
      if (member.status === 'approved') {
        // Decrement roommates_found
        const newFoundCount = Math.max(1, myListing.roommates_found - 1);
        await api.put("/api/roommate-listings", { 
          id: myListing.id, 
          roommates_found: newFoundCount,
          is_full: false 
        });
      }
      
      toast({ title: "Member removed" });
      await fetchData();
    } catch (err: any) {
       toast({ title: "Error", description: "Failed to remove", variant: "destructive" });
    }
  };

  const handleLeaveRoom = async () => {
    if (!user || !myListing) return;
    if (myListing.creator_id === user.id) {
       const confirmed = window.confirm("You are the creator. Leaving will delete the listing. Continue?");
       if (!confirmed) return;
       await api.delete(`/api/roommate-listings?id=${myListing.id}`);
    } else {
       const member = myMembers.find(m => m.user_id === user.id);
       if (member) {
          await api.delete(`/api/roommate-members?id=${member.id}`);
          if (member.status === 'approved') {
            await api.put("/api/roommate-listings", { 
              id: myListing.id, 
              roommates_found: Math.max(1, myListing.roommates_found - 1),
              is_full: false 
            });
          }
       }
    }
    toast({ title: "You left the room" });
    setMyListing(null);
    setView("browse");
    await fetchData();
  };

  const filteredListings = listings.filter((l) => {
    const matchesSearch = l.title.toLowerCase().includes(search.toLowerCase()) || l.location_details.toLowerCase().includes(search.toLowerCase());
    const matchesGender = genderFilter === "All" || l.gender_preference === genderFilter || l.gender_preference === "Any";
    const matchesFull = hideFullRooms ? !l.is_full : true;
    return matchesSearch && matchesGender && matchesFull;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-20 text-center">
          <FadeIn>
            <Home className="h-16 w-16 mx-auto text-primary mb-6" />
            <h1 className="font-display text-3xl font-bold mb-3">Find a Roommate</h1>
            <p className="text-muted-foreground mb-6">Sign in to find the perfect roommate or list a room.</p>
            <Button asChild className="bg-primary text-primary-foreground rounded-lg shadow-sm">
              <a href="/auth">Sign In</a>
            </Button>
          </FadeIn>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <FadeIn>
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold mb-2 text-foreground">
              <Home className="inline h-7 w-7 mr-2 text-primary -mt-1" />
              Find Roommate
            </h1>
            <p className="text-muted-foreground">Find the perfect flatmate near campus</p>
          </div>
        </FadeIn>

        {loading ? (
          <PageSpinner />
        ) : myListing && view === "my-room" ? (
          /* MY ROOM VIEW */
          <FadeIn>
            <Card className="shadow-lg border-primary/20 bg-card overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-primary to-blue-500" />
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <CardTitle className="font-display text-2xl">{myListing.title}</CardTitle>
                    <CardDescription className="text-base mt-2 flex flex-col gap-1">
                      <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {myListing.location_details}</span>
                      <span className="flex items-center gap-1.5"><DollarSign className="h-4 w-4" /> {myListing.rent_per_head} / head</span>
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                     <div className={`px-3 py-1 rounded-full text-sm font-semibold border ${myListing.is_full ? 'bg-secondary/50 text-muted-foreground border-border' : 'bg-primary/10 text-primary border-primary/30'}`}>
                        {myListing.roommates_found} / {myListing.roommates_needed} Roommates
                     </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-xl bg-secondary/30 p-5 border border-border">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{myListing.description}</p>
                </div>

                <div>
                  <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" /> Members
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {myMembers.filter(m => m.status === 'approved').map((m) => (
                      <div key={m.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                             {m.user_id.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium">{m.user_id === user?.id ? "You" : m.user_id.slice(0, 8)}</span>
                              {m.user_id === myListing.creator_id && <Crown className="h-3.5 w-3.5 text-yellow-500" />}
                            </div>
                            <span className="text-xs text-muted-foreground">Approved Roommate</span>
                          </div>
                        </div>
                        {myListing.creator_id === user?.id && m.user_id !== user?.id && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemoveMember(m)} title="Remove member">
                            <LogOut className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pending requests (Creator only) */}
                {myListing.creator_id === user?.id && myMembers.some(m => m.status === 'pending') && (
                  <div className="mt-8">
                    <h3 className="font-display text-lg font-semibold mb-3 text-primary flex items-center gap-2">
                       <UserPlus className="h-5 w-5" /> Join Requests
                    </h3>
                    <div className="space-y-3">
                      {myMembers.filter(m => m.status === 'pending').map((m) => (
                        <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-4 gap-4">
                          <div>
                            <span className="text-sm font-medium text-foreground">{m.user_id.slice(0, 8)}</span>
                            {m.message && <p className="text-sm text-muted-foreground mt-1 italic">"{m.message}"</p>}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-primary text-primary-foreground rounded-lg" onClick={() => handleAcceptRequest(m)} disabled={myListing.is_full}>Accept</Button>
                            <Button size="sm" variant="outline" className="rounded-lg bg-background" onClick={() => handleRejectRequest(m.id)}>Reject</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-secondary/20 border-t border-border p-4 flex flex-wrap gap-3">
                <Button className="bg-primary text-primary-foreground rounded-lg shadow-sm" onClick={() => navigate(`/roommate-chat/${myListing.id}`)}>
                  <MessageCircle className="h-4 w-4 mr-2" /> Group Chat
                </Button>
                <Button variant="outline" className="rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive" onClick={handleLeaveRoom}>
                  <LogOut className="h-4 w-4 mr-2" /> {myListing.creator_id === user?.id ? "Delete Listing" : "Leave Room"}
                </Button>
              </CardFooter>
            </Card>
          </FadeIn>
        ) : (
          /* BROWSE / CREATE VIEW */
          <div className="space-y-8">
            <FadeIn>
              <div className="flex flex-wrap gap-3 justify-center mb-8">
                <Button variant={view === "browse" ? "default" : "outline"} className={`rounded-xl px-6 ${view === 'browse' ? 'shadow-md bg-primary text-primary-foreground' : ''}`} onClick={() => setView("browse")}>
                  <Search className="h-4 w-4 mr-2" /> Browse Rooms
                </Button>
                <Button variant={view === "create" ? "default" : "outline"} className={`rounded-xl px-6 ${view === 'create' ? 'shadow-md bg-primary text-primary-foreground' : ''}`} onClick={() => setView("create")}>
                  <Plus className="h-4 w-4 mr-2" /> List a Room
                </Button>
              </div>
            </FadeIn>

            {view === "create" ? (
              <FadeIn delay={100}>
                <Card className="shadow-lg border-border max-w-2xl mx-auto">
                  <CardHeader className="bg-secondary/30 border-b border-border">
                    <CardTitle className="font-display text-2xl">Post Roommate Request</CardTitle>
                    <CardDescription>Share details about your flat to find the right flatmates.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleCreate} className="space-y-5">
                      <div className="space-y-2">
                        <Label className="text-foreground">Listing Title *</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g., 2 BHK near VIPS Campus - Looking for 1 Roommate" className="bg-background" />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                         <div className="space-y-2">
                           <Label>Rent per head *</Label>
                           <Input value={rentPerHead} onChange={(e) => setRentPerHead(e.target.value)} required placeholder="e.g., ₹8000/month" className="bg-background" />
                         </div>
                         <div className="space-y-2">
                           <Label>Total Roommates Needed *</Label>
                           <Select value={roommatesNeeded} onValueChange={setRoommatesNeeded}>
                             <SelectTrigger className="bg-background">
                               <SelectValue placeholder="Select total capacity" />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="2">2 Roommates Total</SelectItem>
                               <SelectItem value="3">3 Roommates Total</SelectItem>
                               <SelectItem value="4">4 Roommates Total</SelectItem>
                               <SelectItem value="5">5+ Roommates Total</SelectItem>
                             </SelectContent>
                           </Select>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                         <div className="space-y-2">
                           <Label>Location / Landmark *</Label>
                           <Input value={locationDetails} onChange={(e) => setLocationDetails(e.target.value)} required placeholder="e.g., Sector 14, Rohini / 10 mins walk" className="bg-background" />
                         </div>
                         <div className="space-y-2">
                           <Label>Gender Preference</Label>
                           <Select value={genderPref} onValueChange={setGenderPref}>
                             <SelectTrigger className="bg-background">
                               <SelectValue />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="Any">Any Gender</SelectItem>
                               <SelectItem value="Male">Male Only</SelectItem>
                               <SelectItem value="Female">Female Only</SelectItem>
                             </SelectContent>
                           </Select>
                         </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Detailed Description *</Label>
                        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Amenities included, rules, vibe of the flat..." className="min-h-[120px] bg-background" />
                      </div>

                      <div className="pt-4">
                        <Button type="submit" className="w-full bg-primary text-primary-foreground rounded-xl h-12 text-lg shadow-sm" disabled={creating}>
                          {creating ? "Posting..." : "Post Listing"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </FadeIn>
            ) : (
              <FadeIn delay={100}>
                <div className="space-y-6">
                  {/* Filters Bar */}
                  <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search locations, titles..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 rounded-lg bg-background border-border h-11"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                       <Select value={genderFilter} onValueChange={setGenderFilter}>
                         <SelectTrigger className="w-[140px] bg-background h-11">
                           <SelectValue placeholder="Gender" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="All">All Genders</SelectItem>
                           <SelectItem value="Male">Male</SelectItem>
                           <SelectItem value="Female">Female</SelectItem>
                           <SelectItem value="Any">Any</SelectItem>
                         </SelectContent>
                       </Select>
                       <div className="flex items-center space-x-2 bg-background px-3 h-11 rounded-lg border border-border">
                         <Switch id="hide-full" checked={hideFullRooms} onCheckedChange={setHideFullRooms} />
                         <Label htmlFor="hide-full" className="text-sm">Hide Full Rooms</Label>
                       </div>
                    </div>
                  </div>

                  {filteredListings.length === 0 ? (
                    <div className="text-center py-16 px-4">
                       <div className="h-16 w-16 mx-auto bg-secondary rounded-full flex items-center justify-center mb-4">
                          <Search className="h-8 w-8 text-muted-foreground" />
                       </div>
                       <h3 className="text-lg font-semibold mb-2">No rooms found</h3>
                       <p className="text-muted-foreground">Try adjusting your filters or be the first to post a listing!</p>
                    </div>
                  ) : (
                    <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
                      {filteredListings.map((listing) => {
                        // Optimistic UI for pending requests
                        const [isRequested, setIsRequested] = useState(false);
                        const handleJoin = async () => {
                           await handleRequestJoin(listing.id);
                           setIsRequested(true);
                        }

                        return (
                        <Card key={listing.id} className={`border-border flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md ${listing.is_full ? 'opacity-75' : ''}`}>
                          <div className={`h-1.5 w-full ${listing.is_full ? 'bg-secondary' : 'bg-primary'}`} />
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start gap-4 mb-2">
                               <div className="flex flex-wrap gap-2">
                                 <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                                   {listing.gender_preference}
                                 </span>
                                 <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                   <DollarSign className="h-3 w-3 mr-0.5" /> {listing.rent_per_head}
                                 </span>
                               </div>
                               {listing.is_full && (
                                 <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-destructive/10 text-destructive border border-destructive/20">
                                   FULL
                                 </span>
                               )}
                            </div>
                            <CardTitle className="font-display text-lg line-clamp-1">{listing.title}</CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1 text-foreground">
                               <MapPin className="h-3.5 w-3.5 text-primary" /> <span className="line-clamp-1">{listing.location_details}</span>
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="flex-1">
                             <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{listing.description}</p>
                             
                             {/* Progress Bar Badge */}
                             <div className="space-y-1.5 mt-auto">
                               <div className="flex justify-between text-xs font-medium">
                                  <span className="text-muted-foreground">Capacity</span>
                                  <span className={listing.is_full ? 'text-destructive' : 'text-primary'}>
                                     {listing.roommates_found} / {listing.roommates_needed}
                                  </span>
                               </div>
                               <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                  <div 
                                     className={`h-full rounded-full ${listing.is_full ? 'bg-destructive/50' : 'bg-primary'}`} 
                                     style={{ width: `${Math.min(100, (listing.roommates_found / listing.roommates_needed) * 100)}%` }}
                                  />
                               </div>
                             </div>
                          </CardContent>
                          <div className="p-4 pt-0 border-t border-border mt-4 flex justify-end">
                              {listing.is_full ? (
                                <Button disabled variant="outline" className="w-full bg-secondary/50">Room Full</Button>
                              ) : isRequested ? (
                                <Button disabled variant="outline" className="w-full">Request Sent</Button>
                              ) : (
                                <Button className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors" onClick={handleJoin}>
                                  <UserPlus className="h-4 w-4 mr-2" /> Request to Join
                                </Button>
                              )}
                          </div>
                        </Card>
                      )})}
                    </div>
                  )}
                </div>
              </FadeIn>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
