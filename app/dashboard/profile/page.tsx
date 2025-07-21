"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<any>({})
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase.from("store_owners").select("*").eq("id", user.id).single()
    if (!error) {
      setProfile(data)
      setForm({
        store_name: data.store_name,
        owner_name: data.owner_name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      })
    }
    setLoading(false)
  }

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleUpdate = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from("store_owners").update({
      store_name: form.store_name,
      owner_name: form.owner_name,
      phone: form.phone,
      address: form.address,
    }).eq("id", user.id)
    setLoading(false)
    if (!error) {
      setEditing(false)
      toast({ title: "Profile updated!" })
      fetchProfile()
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (!profile) {
    return <div className="flex justify-center items-center min-h-screen">Profile not found.</div>
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Store Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Store Name</label>
                <Input name="store_name" value={form.store_name} onChange={handleChange} />
              </div>
              <div>
                <label className="block mb-1">Owner Name</label>
                <Input name="owner_name" value={form.owner_name} onChange={handleChange} />
              </div>
              <div>
                <label className="block mb-1">Email</label>
                <Input name="email" value={form.email} disabled />
              </div>
              <div>
                <label className="block mb-1">Phone</label>
                <Input name="phone" value={form.phone} onChange={handleChange} />
              </div>
              <div>
                <label className="block mb-1">Address</label>
                <Textarea name="address" value={form.address} onChange={handleChange} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdate} disabled={loading}>Save</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <span className="font-semibold">Store Name:</span> {profile.store_name}
              </div>
              <div>
                <span className="font-semibold">Owner Name:</span> {profile.owner_name}
              </div>
              <div>
                <span className="font-semibold">Email:</span> {profile.email}
              </div>
              <div>
                <span className="font-semibold">Phone:</span> {profile.phone}
              </div>
              <div>
                <span className="font-semibold">Address:</span> {profile.address}
              </div>
              <Button onClick={() => setEditing(true)}>Edit</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 