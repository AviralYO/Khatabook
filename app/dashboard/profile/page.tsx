"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Logo } from "@/components/logo"

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<any>({})
  const { toast } = useToast()
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error("❌ No authenticated user found:", userError)
        router.push("/auth/login")
        return
      }

      console.log("✅ Authenticated user ID:", user.id)
      console.log("✅ User email:", user.email)

      const { data, error } = await supabase
        .from("store_owners")
        .select("*")
        .eq("id", user.id)
        .single()

      if (error) {
        console.error("❌ Error fetching profile:", error)
        
        // If profile doesn't exist, create it from user metadata
        if (error.code === 'PGRST116') { // Not found error
          console.log("🔄 Profile not found, creating from user metadata...")
          await createProfileFromMetadata(user)
          return
        }
        
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
        return
      }

      console.log("✅ Profile loaded:", data)
      setProfile(data)
      setForm({
        store_name: data.store_name,
        owner_name: data.owner_name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      })
    } catch (error) {
      console.error("💥 Error in fetchProfile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createProfileFromMetadata = async (user: any) => {
    try {
      console.log("🔄 Creating profile from user metadata:", user.user_metadata)
      
      const profileData = {
        id: user.id,
        email: user.email,
        store_name: user.user_metadata?.store_name || '',
        owner_name: user.user_metadata?.owner_name || '',
        phone: user.user_metadata?.phone || '',
        address: user.user_metadata?.address || '',
      }

      const { error } = await supabase
        .from("store_owners")
        .insert(profileData)

      if (error) {
        console.error("❌ Error creating profile:", error)
        toast({
          title: "Error",
          description: "Failed to create profile. Please contact support.",
          variant: "destructive",
        })
        return
      }

      console.log("✅ Profile created successfully")
      toast({
        title: "Success",
        description: "Profile created successfully!",
      })

      // Reload the profile
      await fetchProfile()
    } catch (error) {
      console.error("💥 Error creating profile:", error)
    }
  }

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleUpdate = async () => {
    setLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { error } = await supabase
        .from("store_owners")
        .update({
          store_name: form.store_name,
          owner_name: form.owner_name,
          phone: form.phone,
          address: form.address,
        })
        .eq("id", user.id)

      if (error) {
        console.error("❌ Error updating profile:", error)
        throw error
      }

      console.log("✅ Profile updated successfully")
      setEditing(false)
      toast({ 
        title: "Success!", 
        description: "Profile updated successfully" 
      })
      await fetchProfile()
    } catch (error: any) {
      console.error("💥 Error updating profile:", error)
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update profile", 
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Logo className="justify-center mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Logo className="justify-center mb-4" />
          <p className="text-muted-foreground mb-4">Profile not found.</p>
          <Button onClick={fetchProfile}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Store Profile</h1>
            <p className="text-muted-foreground">Manage your store information and settings</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Store Name</label>
                    <Input 
                      name="store_name" 
                      value={form.store_name || ''} 
                      onChange={handleChange} 
                      placeholder="Enter store name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Owner Name</label>
                    <Input 
                      name="owner_name" 
                      value={form.owner_name || ''} 
                      onChange={handleChange} 
                      placeholder="Enter owner name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input 
                      name="email" 
                      value={form.email || ''} 
                      disabled 
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <Input 
                      name="phone" 
                      value={form.phone || ''} 
                      onChange={handleChange} 
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Address</label>
                    <Textarea 
                      name="address" 
                      value={form.address || ''} 
                      onChange={handleChange} 
                      placeholder="Enter store address"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleUpdate} disabled={loading}>
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button variant="outline" onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Store Name</span>
                      <p className="text-lg">{profile.store_name || 'Not set'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Owner Name</span>
                      <p className="text-lg">{profile.owner_name || 'Not set'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Email</span>
                      <p className="text-lg">{profile.email}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Phone</span>
                      <p className="text-lg">{profile.phone || 'Not set'}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Address</span>
                    <p className="text-lg">{profile.address || 'Not set'}</p>
                  </div>
                  <div className="pt-4">
                    <Button onClick={() => setEditing(true)}>Edit Profile</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
              </div>
            </div>
    
  )
}