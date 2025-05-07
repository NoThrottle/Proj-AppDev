"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Cropper from "react-easy-crop";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

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
  const fileInputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropping, setCropping] = useState(false);
  // Add state for password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordUser, setIsPasswordUser] = useState(false);

  useEffect(() => {
    console.log("Session changed:", user);
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      // Always set image to user.image if it exists and is a non-empty string
      if (typeof user.image === "string" && user.image.trim()) {
        console.log("Setting image from session:", user.image);
        setImage(user.image);
      } else {
        // Try to get image from localStorage if session doesn't have it
        const cachedImage = typeof window !== 'undefined' ? localStorage.getItem('profileImage') : null;
        if (cachedImage) {
          console.log("Using cached image from localStorage:", cachedImage);
          setImage(cachedImage);
        }
      }
      // Check if the user is a password-based user
      setIsPasswordUser(user.provider === "credentials");
    }
  }, [user]);

  // Add a useEffect for initial load - try to load from localStorage immediately
  useEffect(() => {
    // Check localStorage for profile image on component mount
    if (typeof window !== 'undefined' && !image) {
      const cachedImage = localStorage.getItem('profileImage');
      if (cachedImage) {
        console.log("Initial load - using cached image from localStorage:", cachedImage);
        setImage(cachedImage);
      }
    }
  }, []); // Empty dependency array - runs once on component mount

  // Add a separate effect to log when image changes
  useEffect(() => {
    console.log("Image state changed:", image);
  }, [image]);

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

  async function handlePasswordChange(e) {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordSuccess("");
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      setPasswordLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");
      setPasswordSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  }

  function onCropComplete(_, croppedAreaPixels) {
    setCroppedAreaPixels(croppedAreaPixels);
  }

  function handleFileInput(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Profile image must be less than 5MB.");
      return;
    }
    setSelectedFile(file);
    setCropDialogOpen(true);
  }

  async function getCroppedImg(imageSrc, crop) {
    return new Promise((resolve, reject) => {
      const image = new window.Image();
      image.crossOrigin = "anonymous";
      image.src = imageSrc;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 250;
        canvas.height = 250;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(
          image,
          crop.x,
          crop.y,
          crop.width,
          crop.height,
          0,
          0,
          250,
          250
        );
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error("Failed to create blob"));
          resolve(blob);
        }, "image/jpeg", 0.95);
      };
      image.onerror = reject;
    });
  }

  async function handleCropSave() {
    if (!selectedFile || !croppedAreaPixels || !user?.id) {
      setError("Please select and crop an image before saving.");
      setCropping(false);
      return;
    }
    setCropping(true);
    try {
      const imageUrl = URL.createObjectURL(selectedFile);
      // Wait for the image to be loaded before cropping
      await new Promise((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl;
        img.onload = resolve;
        img.onerror = reject;
      });
      const croppedBlob = await getCroppedImg(imageUrl, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Cropping failed");
      const formData = new FormData();
      formData.append("image", croppedBlob, "profile.jpg");
      
      // Use NEXT_PUBLIC_CDN_URL for client-side fetches
      const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || process.env.CDN_URL || "http://localhost:3315";
      console.log("Using CDN URL:", cdnUrl);
      
      const uploadRes = await fetch(`${cdnUrl}/api/upload?folder=${user.id}`, {
        method: "POST",
        body: formData,
      });
      
      if (uploadRes.ok) {
        const { filename } = await uploadRes.json();
        const newImageUrl = `${cdnUrl}/images/${user.id}/${filename}`;
        console.log("New image URL:", newImageUrl);
        
        // First update the local state with cache busting
        const imageWithCacheBusting = `${newImageUrl}?t=${Date.now()}`;
        setImage(imageWithCacheBusting);
        
        // Now update the database
        const updateRes = await fetch("/api/account/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: newImageUrl }),
        });
        
        if (!updateRes.ok) {
          console.error("Failed to update user image in database");
          throw new Error("Failed to update profile image");
        }
        
        // After database update completes, update the session
        await update();
        
        // Now store the image URL in localStorage as a backup
        localStorage.setItem('profileImage', imageWithCacheBusting);
        
        setError("");
        setCropDialogOpen(false);
        setSelectedFile(null);
      } else {
        setError("Failed to upload image. Please try again.");
      }
    } catch (err) {
      setError("Failed to crop or upload image. Please try again. " + (err?.message || ""));
    }
    setCropping(false);
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
                <label className="block mb-1 font-medium">Profile Image</label>
                <div className="flex items-center gap-4">
                  {console.log("Profile image src:", image)}
                  {image && image !== "undefined" && image !== "null" ? (
                    <Image
                      src={image}
                      alt="Profile"
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full object-cover border"
                      onError={() => setImage("/file.svg")}
                    />
                  ) : (
                    <Image src="/file.svg" alt="Default Profile" width={80} height={80} className="w-20 h-20 rounded-full object-cover border" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileInput}
                  />
                  <Button type="button" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                    {uploading ? "Uploading..." : "Change Image"}
                  </Button>
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <Input value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              {success && <div className="text-green-600">{success}</div>}
              {error && <div className="text-red-600">{error}</div>}
              <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
            </form>
            <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
              <DialogContent className="max-w-md w-full">
                <DialogTitle>Crop Profile Image</DialogTitle>
                {selectedFile && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative w-64 h-64 bg-black">
                      <Cropper
                        image={URL.createObjectURL(selectedFile)}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                      />
                    </div>
                    <div className="flex gap-4 w-full items-center">
                      <label className="text-sm">Zoom</label>
                      <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.01}
                        value={zoom}
                        onChange={e => setZoom(Number(e.target.value))}
                        className="flex-1"
                      />
                    </div>
                    <div className="flex gap-2 w-full justify-end">
                      <Button type="button" variant="outline" onClick={() => setCropDialogOpen(false)} disabled={cropping}>Cancel</Button>
                      <Button type="button" onClick={handleCropSave} disabled={cropping}>
                        {cropping ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        )}
        {activeTab === "security" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Security</h2>
            {isPasswordUser ? (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Current Password</label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">New Password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Confirm New Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                {passwordSuccess && <div className="text-green-600">{passwordSuccess}</div>}
                {passwordError && <div className="text-red-600">{passwordError}</div>}
                <Button type="submit" disabled={passwordLoading}>
                  {passwordLoading ? "Changing..." : "Change Password"}
                </Button>
              </form>
            ) : (
              <div className="text-gray-500">Password change is not available for your account type.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
