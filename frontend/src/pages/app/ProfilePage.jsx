import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  MapPin,
  Briefcase,
  Github,
  Linkedin,
  Globe,
  Save,
  Flame,
  Edit3,
  X,
  Plus,
  Phone,
  ExternalLink,
  Camera,
  Trash2
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { Card, Button } from "../../components/ui";
import { cn, getInitials } from "../../lib/utils";

const AVATAR_KEY = (userId) => `profile_avatar_${userId}`;

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [avatarSrc, setAvatarSrc] = useState(null);
  const fileInputRef = useRef(null);

  // Load saved avatar from localStorage on mount
  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(AVATAR_KEY(user.id));
      if (saved) setAvatarSrc(saved);
    }
  }, [user?.id]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be smaller than 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setAvatarSrc(base64);
      if (user?.id) localStorage.setItem(AVATAR_KEY(user.id), base64);
      toast.success("Profile photo updated!");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarSrc(null);
    if (user?.id) localStorage.removeItem(AVATAR_KEY(user.id));
    toast.success("Profile photo removed.");
  };

  const [form, setForm] = useState({
    full_name: "",
    bio: "",
    phone: "",
    location: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
    target_role: "",
    experience_level: "",
    skills: []
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        phone: profile.phone || "",
        location: profile.location || "",
        linkedin_url: profile.linkedin_url || "",
        github_url: profile.github_url || "",
        portfolio_url: profile.portfolio_url || "",
        target_role: profile.target_role || "",
        experience_level: profile.experience_level || "",
        skills: Array.isArray(profile.skills) ? profile.skills : []
      });
    }
  }, [profile]);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) {
      setForm({ ...form, skills: [...form.skills, s] });
      setSkillInput("");
    }
  };

  const removeSkill = (s) => {
    setForm({ ...form, skills: form.skills.filter((x) => x !== s) });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        full_name: form.full_name,
        bio: form.bio,
        phone: form.phone,
        location: form.location,
        linkedin_url: form.linkedin_url,
        github_url: form.github_url,
        portfolio_url: form.portfolio_url,
        target_role: form.target_role,
        experience_level: form.experience_level,
        skills: form.skills
      };

      const response = await api.updateProfile(payload);
      if (response.error) {
        toast.error(response.error || "Failed to save profile changes.");
      } else {
        toast.success("Profile saved successfully!");
        await refreshProfile();
        setIsEditing(false); // Switch to View Mode so changes are immediately visible!
      }
    } catch (err) {
      toast.error("An error occurred while saving profile.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        phone: profile.phone || "",
        location: profile.location || "",
        linkedin_url: profile.linkedin_url || "",
        github_url: profile.github_url || "",
        portfolio_url: profile.portfolio_url || "",
        target_role: profile.target_role || "",
        experience_level: profile.experience_level || "",
        skills: Array.isArray(profile.skills) ? profile.skills : []
      });
    }
    setIsEditing(false);
  };

  const levels = ["junior", "mid", "senior", "lead"];

  const currentFullName = form.full_name || profile?.full_name || "User";
  const currentEmail = user?.email || "";
  const currentRole = form.target_role || profile?.target_role || "Not specified";

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900">
            My Profile
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Manage your personal profile, career preferences, and skills.
          </p>
        </div>

        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold px-4 py-2.5 flex items-center gap-2 shadow-sm"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="rounded-xl border-gray-200 text-gray-700 px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold px-5 py-2 flex items-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving…" : "Save Changes"}</span>
            </Button>
          </div>
        )}
      </div>

      {/* Main Profile Header Banner Card */}
      {/* Hidden file input for avatar */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        className="hidden"
        onChange={handleAvatarChange}
      />
      <div className="rounded-2xl p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar with camera upload overlay */}
          <div className="relative flex-shrink-0 group">
            <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-bold border border-white/30 text-white shadow-inner overflow-hidden">
              {avatarSrc ? (
                <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                getInitials(currentFullName || currentEmail)
              )}
            </div>
            {/* Camera overlay button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "absolute inset-0 rounded-2xl bg-black/50 flex flex-col items-center justify-center transition-opacity cursor-pointer",
                isEditing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
              title="Upload profile photo"
            >
              <Camera className="w-6 h-6 text-white" />
              <span className="text-[10px] text-white/90 font-semibold mt-1">Upload</span>
            </button>
            {/* Remove photo button (edit mode only, shown when photo exists) */}
            {isEditing && avatarSrc && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-md transition"
                title="Remove profile photo"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="font-display font-bold text-2xl">{currentFullName}</h2>
              {form.experience_level && (
                <span className="inline-block self-center sm:self-auto px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold uppercase tracking-wider">
                  {form.experience_level} Level
                </span>
              )}
            </div>
            <p className="text-white/90 text-sm flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-4 h-4 text-white/80" />
              <span>{currentEmail}</span>
            </p>
            {form.target_role && (
              <p className="text-emerald-100 text-sm font-medium flex items-center justify-center sm:justify-start gap-1.5">
                <Briefcase className="w-4 h-4" />
                <span>{form.target_role}</span>
              </p>
            )}

            {/* Quick Stats Counter */}
            <div className="flex gap-6 mt-4 pt-3 border-t border-white/20 justify-center sm:justify-start">
              <div>
                <p className="font-display font-bold text-xl">{profile?.total_interviews || 0}</p>
                <p className="text-xs text-white/80">Interviews</p>
              </div>
              <div>
                <p className="font-display font-bold text-xl flex items-center gap-1">
                  <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
                  {profile?.streak_count || 0}
                </p>
                <p className="text-xs text-white/80">Day Streak</p>
              </div>
              <div>
                <p className="font-display font-bold text-xl">
                  {profile?.avg_score ? `${Math.round(profile.avg_score)}%` : "—"}
                </p>
                <p className="text-xs text-white/80">Avg Score</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* READ-ONLY VIEW MODE */}
      {!isEditing ? (
        <div className="space-y-6">
          {/* Bio & Details Card */}
          <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-display font-semibold text-lg text-gray-900 border-b border-gray-100 pb-3 flex items-center justify-between">
              <span>Personal Information</span>
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </h3>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Full Name</span>
                <p className="text-gray-900 font-medium">{form.full_name || "—"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Email Address</span>
                <p className="text-gray-900 font-medium">{currentEmail}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Phone Number</span>
                <p className="text-gray-900 font-medium">{form.phone || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Location</span>
                <p className="text-gray-900 font-medium">{form.location || "Not provided"}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 space-y-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Bio</span>
              <p className="text-gray-800 text-sm leading-relaxed">
                {form.bio || "No bio added yet. Click 'Edit Profile' to add a short bio."}
              </p>
            </div>
          </Card>

          {/* Career & Skills Card */}
          <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-display font-semibold text-lg text-gray-900 border-b border-gray-100 pb-3 flex items-center justify-between">
              <span>Career & Technical Skills</span>
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </h3>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Target Role</span>
                <p className="text-gray-900 font-medium">{form.target_role || "Not specified"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Experience Level</span>
                <p className="text-gray-900 font-medium capitalize">{form.experience_level || "Not specified"}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 space-y-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Technical Skills</span>
              {form.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {form.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No skills added yet.</p>
              )}
            </div>
          </Card>

          {/* Social & Professional Links Card */}
          <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-display font-semibold text-lg text-gray-900 border-b border-gray-100 pb-3 flex items-center justify-between">
              <span>Professional Links</span>
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </h3>

            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { label: "LinkedIn", value: form.linkedin_url, icon: Linkedin, color: "text-blue-600" },
                { label: "GitHub", value: form.github_url, icon: Github, color: "text-gray-900" },
                { label: "Portfolio", value: form.portfolio_url, icon: Globe, color: "text-emerald-600" }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                      <Icon className={cn("w-4 h-4", item.color)} />
                      <span>{item.label}</span>
                    </div>
                    {item.value ? (
                      <a
                        href={item.value.startsWith("http") ? item.value : `https://${item.value}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-medium text-emerald-600 hover:underline flex items-center gap-1 truncate"
                      >
                        <span className="truncate">{item.value}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    ) : (
                      <p className="text-xs text-gray-400 italic">Not set</p>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      ) : (
        /* EDIT FORM MODE */
        <div className="space-y-6">
          {/* Personal Info Edit Card */}
          <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-4">
            <h2 className="font-display font-semibold text-lg text-gray-900 border-b border-gray-100 pb-3">
              Personal Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-gray-900 transition"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={currentEmail}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-gray-900 transition"
                    placeholder="+1 (555) 012-3456"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-gray-900 transition"
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                Bio
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                className="w-full p-3.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-gray-900 transition resize-none"
                placeholder="Write a brief professional summary about yourself..."
              />
            </div>
          </Card>

          {/* Career & Skills Edit Card */}
          <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-4">
            <h2 className="font-display font-semibold text-lg text-gray-900 border-b border-gray-100 pb-3">
              Career Details & Skills
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Target Role
                </label>
                <input
                  type="text"
                  value={form.target_role}
                  onChange={(e) => setForm({ ...form, target_role: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-gray-900 transition"
                  placeholder="e.g. Senior Full Stack Engineer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Experience Level
                </label>
                <div className="flex gap-1.5">
                  {levels.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setForm({ ...form, experience_level: l })}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition cursor-pointer border",
                        form.experience_level === l
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Skills & Technologies
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-gray-900"
                  placeholder="Type a skill (e.g. React, Python) and press Enter"
                />
                <Button
                  type="button"
                  onClick={addSkill}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold px-4"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {form.skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-100"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(s)}
                      className="hover:text-red-600 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* Links Edit Card */}
          <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-4">
            <h2 className="font-display font-semibold text-lg text-gray-900 border-b border-gray-100 pb-3">
              Professional & Social Links
            </h2>

            <div className="space-y-3">
              {[
                { key: "linkedin_url", label: "LinkedIn Profile", icon: Linkedin, placeholder: "https://linkedin.com/in/username" },
                { key: "github_url", label: "GitHub Profile", icon: Github, placeholder: "https://github.com/username" },
                { key: "portfolio_url", label: "Portfolio Website", icon: Globe, placeholder: "https://yourportfolio.com" }
              ].map((l) => {
                const Icon = l.icon;
                return (
                  <div key={l.key}>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">
                      {l.label}
                    </label>
                    <div className="relative">
                      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="url"
                        value={form[l.key]}
                        onChange={(e) => setForm({ ...form, [l.key]: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-gray-900 transition"
                        placeholder={l.placeholder}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="rounded-xl border-gray-200 text-gray-700 px-5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold px-6 py-2.5 flex items-center gap-2 shadow-md shadow-emerald-600/20"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Changes…" : "Save Changes"}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
