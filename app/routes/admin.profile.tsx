import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { ChangeEvent, FormEvent } from "react";
import { supabase } from "../services/supabase";


type Profile = {
  id: string;
  name: string;
  position: string | null;
  field: string | null;
  bio: string | null;
  email: string | null;
  linkedin: string | null;
  orchid_id: string | null;
  address: string | null;
  phone: string | null;
  x_account: string | null;
  profile_image_url: string | null;
  banner_image_url: string | null;
};

const emptyForm = {
  name: "",
  position: "",
  field: "",
  bio: "",
  email: "",
  linkedin: "",
  orchid_id: "",
  address: "",
  phone: "",
  x_account: "",
  profile_image_url: "",
  banner_image_url: "",
};

export default function AdminProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState(emptyForm);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/admin/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data) {
        setProfile(data);

        setForm({
  name: data.name ?? "",
  position: data.position ?? "",
  field: data.field ?? "",
  bio: data.bio ?? "",
  email: data.email ?? "",
  linkedin: data.linkedin ?? "",
  orchid_id: data.orchid_id ?? "",
  address: data.address ?? "",
  phone: data.phone ?? "",
  x_account: data.x_account ?? "",
  profile_image_url: data.profile_image_url ?? "",
  banner_image_url: data.banner_image_url ?? "",
});
      }

      setLoading(false);
    }

    loadProfile();
  }, [navigate]);

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function uploadProfileImage(file: File) {
    const extension = file.name.split(".").pop();
    const fileName = `profile-${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from("profile-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      setError(error.message);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("profile-images")
      .getPublicUrl(fileName);

    return publicUrl;
  }

  async function uploadBannerImage(file: File) {
    const extension = file.name.split(".").pop();
    const fileName = `banner-${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from("profile-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      setError(error.message);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("profile-images")
      .getPublicUrl(fileName);

    return publicUrl;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You are not authenticated.");
      setSaving(false);
      return;
    }

    let profileImageUrl = profile?.profile_image_url ?? null;

    if (imageFile) {
      const uploadedUrl = await uploadProfileImage(imageFile);

      if (!uploadedUrl) {
        setSaving(false);
        return;
      }

      profileImageUrl = uploadedUrl;
    }

    let bannerImageUrl = profile?.banner_image_url ?? null;

    if (bannerFile) {
      const uploadedUrl = await uploadBannerImage(bannerFile);

      if (!uploadedUrl) {
        setSaving(false);
        return;
      }

      bannerImageUrl = uploadedUrl;
    }

    const payload = {
  name: form.name,
  position: form.position,
  field: form.field,
  bio: form.bio,
  email: form.email,
  linkedin: form.linkedin,
  orchid_id: form.orchid_id,
  address: form.address,
  phone: form.phone,
  x_account: form.x_account,
  profile_image_url: profileImageUrl,
  banner_image_url: bannerImageUrl,
  updated_at: new Date().toISOString(),
};

    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      setError(fetchError.message);
      setSaving(false);
      return;
    }

    let saveError;

    if (existingProfile) {
      const { error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", existingProfile.id);

      saveError = error;
    } else {
      const { error } = await supabase
        .from("profiles")
        .insert(payload);

      saveError = error;
    }

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }

    const { data: updatedProfile, error: reloadError } = await supabase
      .from("profiles")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (reloadError) {
      setError(reloadError.message);
      setSaving(false);
      return;
    }

    setProfile(updatedProfile ?? null);

    if (updatedProfile) {
  setForm({
    name: updatedProfile.name ?? "",
    position: updatedProfile.position ?? "",
    field: updatedProfile.field ?? "",
    bio: updatedProfile.bio ?? "",
    email: updatedProfile.email ?? "",
    linkedin: updatedProfile.linkedin ?? "",
    orchid_id: updatedProfile.orchid_id ?? "",
    address: updatedProfile.address ?? "",
    phone: updatedProfile.phone ?? "",
    x_account: updatedProfile.x_account ?? "",
    profile_image_url:
      updatedProfile.profile_image_url ?? "",
    banner_image_url:
      updatedProfile.banner_image_url ?? "",
  });
}
    

    setImageFile(null);
    setBannerFile(null);
    setSaving(false);
    setSuccess("Profile saved successfully.");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/admin/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

return (
  <main className="min-h-screen bg-[#0b0f14] px-6 py-10 text-white">
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-6">
        <div>
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="mb-4 text-sm text-gray-500 transition hover:text-white"
          >
            ← Back to dashboard
          </button>

          <p className="text-xs font-medium uppercase tracking-[0.3em] text-gray-600">
            Administration
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Profile
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Manage the main professor profile.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          Logout
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-2xl border border-white/10 bg-[#111820] p-6 md:p-8"
      >
        {/* Messages */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            {success}
          </div>
        )}

        {/* Basic Information */}
        <section className="space-y-6">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gray-600">
              Basic Information
            </p>

            <h2 className="mt-2 text-lg font-semibold text-gray-100">
              Professor Profile
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Main information displayed throughout the website.
            </p>
          </div>

          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Name
            </label>

            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-700 focus:border-white/30"
              placeholder="Professor Name"
            />
          </div>

          <div>
            <label
              htmlFor="position"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Position
            </label>

            <input
              id="position"
              name="position"
              value={form.position}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-700 focus:border-white/30"
              placeholder="Professor of Computer Science"
            />
          </div>

          <div>
            <label
              htmlFor="field"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Research Field
            </label>

            <input
              id="field"
              name="field"
              value={form.field}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-700 focus:border-white/30"
              placeholder="Artificial Intelligence & Machine Learning"
            />
          </div>

          <div>
            <label
              htmlFor="bio"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Biography
            </label>

            <textarea
              id="bio"
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={7}
              className="w-full resize-y rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-700 focus:border-white/30"
              placeholder="Write the professor biography..."
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-700 focus:border-white/30"
              placeholder="professor@university.edu"
            />
          </div>

          <div>
            <label
              htmlFor="linkedin"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              LinkedIn
            </label>

            <input
              id="linkedin"
              name="linkedin"
              type="url"
              value={form.linkedin}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-700 focus:border-white/30"
              placeholder="https://linkedin.com/in/..."
            />
          </div>
        </section>

        {/* Contact Information */}
        <section className="space-y-6 border-t border-white/10 pt-8">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gray-600">
              Contact
            </p>

            <h2 className="mt-2 text-lg font-semibold text-gray-100">
              Contact Information
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              These details will be displayed in the website footer.
            </p>
          </div>

          {/* ORCID */}
          <div>
            <label
              htmlFor="orchid_id"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              ORCID ID
            </label>

            <input
              id="orchid_id"
              name="orchid_id"
              value={form.orchid_id}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-700 focus:border-white/30"
              placeholder="0000-0000-0000-0000"
            />
          </div>

          {/* Address */}
          <div>
            <label
              htmlFor="address"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Address
            </label>

            <textarea
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={3}
              className="w-full resize-y rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-700 focus:border-white/30"
              placeholder="University / Department / Office address"
            />
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Phone Number
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-700 focus:border-white/30"
              placeholder="+1 ..."
            />
          </div>

          {/* X */}
          <div>
            <label
              htmlFor="x_account"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              X Account
            </label>

            <input
              id="x_account"
              name="x_account"
              type="url"
              value={form.x_account}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-700 focus:border-white/30"
              placeholder="https://x.com/username"
            />
          </div>
        </section>

        {/* Images */}
        <section className="space-y-8 border-t border-white/10 pt-8">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gray-600">
              Media
            </p>

            <h2 className="mt-2 text-lg font-semibold text-gray-100">
              Profile & Hero Images
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Upload the images used on the public portfolio.
            </p>
          </div>

          {/* Profile Image */}
          <div>
            <label
              htmlFor="profile-image"
              className="mb-3 block text-sm font-medium text-gray-300"
            >
              Profile Image
            </label>

            {profile?.profile_image_url && (
              <div className="mb-4 flex items-center gap-4">
                <div className="rounded-full border border-white/10 bg-[#0b0f14] p-1">
                  <img
                    src={profile.profile_image_url}
                    alt={profile.name}
                    className="h-28 w-28 rounded-full object-cover"
                  />
                </div>

                <div>
                  <p className="text-sm text-gray-300">
                    Current profile image
                  </p>
                  <p className="mt-1 text-xs text-gray-600">
                    Upload a new image to replace it.
                  </p>
                </div>
              </div>
            )}

            <input
              id="profile-image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                setImageFile(event.target.files?.[0] ?? null);
              }}
              className="block w-full cursor-pointer rounded-lg border border-white/10 bg-[#0b0f14] text-sm text-gray-400 file:mr-4 file:border-0 file:border-r file:border-white/10 file:bg-white/5 file:px-4 file:py-3 file:text-sm file:font-medium file:text-gray-300 hover:file:bg-white/10"
            />

            <p className="mt-2 text-xs text-gray-600">
              PNG, JPG or WebP
            </p>
          </div>

          {/* Hero Banner */}
          <div>
            <label
              htmlFor="banner-image"
              className="mb-3 block text-sm font-medium text-gray-300"
            >
              Hero Banner
            </label>

            {profile?.banner_image_url && (
              <div className="mb-4 overflow-hidden rounded-xl border border-white/10 bg-[#0b0f14]">
                <img
                  src={profile.banner_image_url}
                  alt="Hero Banner"
                  className="h-48 w-full object-cover"
                />
              </div>
            )}

            <input
              id="banner-image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                setBannerFile(event.target.files?.[0] ?? null);
              }}
              className="block w-full cursor-pointer rounded-lg border border-white/10 bg-[#0b0f14] text-sm text-gray-400 file:mr-4 file:border-0 file:border-r file:border-white/10 file:bg-white/5 file:px-4 file:py-3 file:text-sm file:font-medium file:text-gray-300 hover:file:bg-white/10"
            />

            <p className="mt-2 text-xs text-gray-600">
              PNG, JPG or WebP. Recommended: wide landscape image.
            </p>
          </div>
        </section>

        {/* Save */}
        <div className="border-t border-white/10 pt-8">
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-white px-5 py-3 font-medium text-gray-900 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>

      {/* Footer */}
      <div className="mt-8 border-t border-white/10 pt-6">
        <p className="text-xs text-gray-600">
          Portfolio Management System
        </p>
      </div>
    </div>
  </main>
);

}