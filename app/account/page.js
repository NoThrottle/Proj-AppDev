"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const TABS = [
  { key: "profile", label: "Profile" },
  { key: "security", label: "Security" },
  // Future: { key: "delete", label: "Delete Account" },
];

export default function AccountSettingsPage() {
  const { data: session, update } = useSession();
  const user = session?.user;
  const [activeTab, setActiveTab] = useState("profile");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setImage(user.image || "");
    }
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const res = await fetch("/api/account/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, image }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      setSuccess("Profile updated!");
      update(); // Refresh session
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!user) return <div className="p-6">You must be logged in to view this page.</div>;

  return (
    <div className="flex max-w-5xl mx-auto p-6 gap-8">
      {/* Sidebar */}
      <div className="w-48 h-full border-r pr-4 flex flex-col">
        <nav className="flex flex-col gap-2">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`text-left px-3 py-2 rounded transition-colors font-medium ${activeTab === tab.key ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-700"}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      {/* Content */}
      <div className="flex-1">
        {activeTab === "profile" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <Input value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="block mb-1 font-medium">Profile Image URL</label>
                <Input value={image} onChange={e => setImage(e.target.value)} />
              </div>
              {success && <div className="text-green-600">{success}</div>}
              {error && <div className="text-red-600">{error}</div>}
              <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
            </form>
          </div>
        )}
        {activeTab === "security" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Security</h2>
            <div className="text-gray-500">Password change and security settings coming soon.</div>
          </div>
        )}
      </div>
    </div>
  );
}
