import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  User,
  ShieldCheck,
  KeyRound,
  Lock,
  Mail,
  Phone,
  MapPin,
  Building,
  CheckCircle,
  Camera,
  Coins,
  CreditCard,
} from "lucide-react";
import { meta } from "@/components/site";
import { getCurrentSession, updateUserDetails, type BankUser } from "@/lib/bank-store";

export const Route = createFileRoute("/account-profile")({
  head: () =>
    meta(
      "Profile, Limits & Security Settings — Stronghold Vault Trust",
      "Manage customer account profile, phone, address, photo, transfer PIN, and password."
    ),
  component: AccountProfilePage,
});

function AccountProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<BankUser | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  // PIN & Password states
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);

  useEffect(() => {
    const session = getCurrentSession();
    if (!session) {
      navigate({ to: "/login" });
      return;
    }
    setUser(session);
    setFullName(session.fullName);
    setUsername(session.username || session.email.split("@")[0]);
    setEmail(session.email);
    setPhone(session.phone);
    setAvatarUrl(session.avatarUrl || "");
    setAddress(session.address);
    setCity(session.city);
    setCountry(session.country);
  }, [navigate]);

  if (!user) return null;

  const handleUpdateProfilePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const updated = updateUserDetails(user.id, { avatarUrl });
    if (updated) {
      setUser(updated);
      setFeedback({ text: "Profile picture URL updated successfully!" });
    }
  };

  const handleSavePersonalDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const updated = updateUserDetails(user.id, {
      fullName,
      username,
      phone,
      address,
      city,
      country,
    });

    if (updated) {
      setUser(updated);
      setFeedback({ text: "Personal details and contact information updated successfully!" });
    }
  };

  const handleResetPin = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (currentPin !== user.pin) {
      setFeedback({ text: "Current 4-digit PIN does not match.", error: true });
      return;
    }
    if (!/^\d{4}$/.test(newPin)) {
      setFeedback({ text: "New PIN must be exactly 4 digits.", error: true });
      return;
    }
    if (newPin !== confirmNewPin) {
      setFeedback({ text: "New PIN confirmation does not match.", error: true });
      return;
    }

    const updated = updateUserDetails(user.id, { pin: newPin });
    if (updated) {
      setUser(updated);
      setCurrentPin("");
      setNewPin("");
      setConfirmNewPin("");
      setFeedback({ text: "4-Digit Transfer Security PIN updated successfully!" });
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (newPassword.length < 6) {
      setFeedback({ text: "Password must be at least 6 characters.", error: true });
      return;
    }

    const updated = updateUserDetails(user.id, { loginPassword: newPassword });
    if (updated) {
      setUser(updated);
      setCurrentPassword("");
      setNewPassword("");
      setFeedback({ text: "Web Login Password updated successfully!" });
    }
  };

  const initialLetter = (user.fullName || "U").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#081528] text-white pb-16">
      {/* Top Header */}
      <header className="border-b border-primary-foreground/10 bg-[#0a1b33]">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gold text-[#081528] font-bold text-xs">
              {initialLetter}
            </span>
            <span className="text-sm font-semibold text-white">{user.username || user.fullName}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 pt-8">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold text-[#081528] shadow-md">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Profile, Limits & Security Settings</h1>
            <p className="text-xs text-primary-foreground/70">
              Manage personal identity, contact address, photo, transfer PIN, and password.
            </p>
          </div>
        </div>

        {feedback && (
          <div
            className={`mt-6 rounded-xl p-4 text-xs font-semibold ${
              feedback.error ? "border border-red-500/30 bg-red-500/20 text-red-200" : "border border-emerald-500/30 bg-emerald-500/20 text-emerald-200"
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* Card 1: Account Profile & Photo */}
        <div className="mt-8 rounded-2xl border border-white/20 bg-white p-6 text-[#12233b] shadow-xl md:p-8">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Account Profile</span>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700">
              Verified
            </span>
          </div>

          <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="relative">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="h-20 w-20 rounded-2xl border-2 border-red-600 object-cover shadow-md"
                />
              ) : (
                <div className="grid h-20 w-20 place-items-center rounded-2xl border-2 border-red-600 bg-[#081528] text-3xl font-extrabold text-white shadow-md">
                  {initialLetter}
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-[#0a1b33]">{user.username || user.fullName}</h2>
              <p className="text-xs text-gray-500">Profile Picture Saved & Synchronized</p>

              {/* Photo URL Form */}
              <form onSubmit={handleUpdateProfilePhoto} className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or direct image URL"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs text-[#0a1b33] focus:border-red-600 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors"
                >
                  Update
                </button>
              </form>
            </div>
          </div>

          {/* Quick Summary Strip */}
          <div className="mt-6 space-y-2.5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Account Holder:</span>
              <span className="font-bold text-[#0a1b33]">{user.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Registered Email:</span>
              <span className="font-mono font-semibold text-[#0a1b33]">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Account Status:</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                <CheckCircle className="h-3.5 w-3.5" /> Fully Verified (Tier 2 FDIC)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Checking Balance:</span>
              <span className="font-bold text-[#0a1b33]">
                ${user.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Savings Balance:</span>
              <span className="font-bold text-[#0a1b33]">
                ${user.savingsBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Edit Personal & Contact Details */}
        <div className="mt-8 rounded-2xl border border-white/20 bg-white p-6 text-[#12233b] shadow-xl md:p-8">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <User className="h-4 w-4 text-gold-ink" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
              Personal & Contact Information
            </h2>
          </div>

          <form onSubmit={handleSavePersonalDetails} className="mt-6 space-y-4 text-xs">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="font-bold uppercase text-gray-500">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-semibold text-[#0a1b33] focus:border-[#0a1b33] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-gray-500">Username / Display Alias</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-semibold text-[#0a1b33] focus:border-[#0a1b33] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="font-bold uppercase text-gray-500">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-semibold text-[#0a1b33] focus:border-[#0a1b33] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-gray-500">Registered Email (Read-Only)</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="font-bold uppercase text-gray-500">Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-semibold text-[#0a1b33] focus:border-[#0a1b33] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-gray-500">City / State</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-semibold text-[#0a1b33] focus:border-[#0a1b33] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-gray-500">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-semibold text-[#0a1b33] focus:border-[#0a1b33] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="cta-glow rounded-lg bg-gold px-6 py-2.5 text-xs font-bold text-[#081528] hover:bg-gold-deep transition-all"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>

        {/* Card 3: Transfer Security & PIN */}
        <div className="mt-8 rounded-2xl border border-white/20 bg-white p-6 text-[#12233b] shadow-xl md:p-8">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                Transfer Security & PIN
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Your secret transfer PIN is required to authorize all wire transfers and external payments.
              </p>
            </div>
            <span className="rounded bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 uppercase">
              Active
            </span>
          </div>

          <form onSubmit={handleResetPin} className="mt-6 space-y-4 text-xs">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="font-bold uppercase text-gray-500">Current 4-Digit PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  placeholder="••••"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))}
                  className="mt-1 w-full tracking-[0.4em] rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-center text-sm font-bold text-[#0a1b33] focus:border-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-gray-500">New 4-Digit PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  placeholder="••••"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                  className="mt-1 w-full tracking-[0.4em] rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-center text-sm font-bold text-[#0a1b33] focus:border-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-gray-500">Confirm New PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  placeholder="••••"
                  value={confirmNewPin}
                  onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, ""))}
                  className="mt-1 w-full tracking-[0.4em] rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-center text-sm font-bold text-[#0a1b33] focus:border-red-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="rounded-lg bg-[#0a1b33] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#122b52] transition-colors"
              >
                Reset or Change Transfer PIN
              </button>
            </div>
          </form>
        </div>

        {/* Card 4: Web Login Password */}
        <div className="mt-8 rounded-2xl border border-white/20 bg-white p-6 text-[#12233b] shadow-xl md:p-8">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <Lock className="h-4 w-4 text-gray-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
              Update Web Login Password
            </h2>
          </div>

          <form onSubmit={handleUpdatePassword} className="mt-6 space-y-4 text-xs">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="font-bold uppercase text-gray-500">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-semibold text-[#0a1b33] focus:border-red-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="rounded-lg border border-gray-300 bg-gray-100 px-6 py-2.5 text-xs font-bold text-gray-800 hover:bg-gray-200 transition-colors"
              >
                Update Web Login Password
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
