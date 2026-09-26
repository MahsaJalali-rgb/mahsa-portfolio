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
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate("/admin")}
              className="mb-3 text-sm text-gray-500 hover:text-gray-900"
            >
              ← Back to dashboard
            </button>

            <h1 className="text-3xl font-bold">
              Profile
            </h1>

            <p className="mt-2 text-gray-500">
              Manage the main professor profile.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-white"
          >
            Logout
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl bg-white p-8 shadow-sm"
        >
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
              {success}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Name
            </label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
              placeholder="Professor Name"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Position
            </label>

            <input
              name="position"
              value={form.position}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
              placeholder="Professor of Computer Science"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Research Field
            </label>

            <input
              name="field"
              value={form.field}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
              placeholder="Artificial Intelligence & Machine Learning"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Biography
            </label>

            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={7}
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
              placeholder="Write the professor biography..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Email
            </label>

            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
              placeholder="professor@university.edu"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              LinkedIn
            </label>

            <input
              name="linkedin"
              type="url"
              value={form.linkedin}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
              placeholder="https://linkedin.com/in/..."
            />
          </div>

          {/* Contact Information */}
<div className="space-y-6 border-t border-gray-200 pt-6">
  <div>
    <h2 className="text-lg font-semibold">
      Contact Information
    </h2>

    <p className="mt-1 text-sm text-gray-500">
      These details will be displayed in the website footer.
    </p>
  </div>

  {/* Orchid ID */}
  <div>
    <label
      htmlFor="orchid_id"
      className="mb-2 block text-sm font-medium"
    >
      Orchid ID
    </label>

    <input
      id="orchid_id"
      name="orchid_id"
      value={form.orchid_id}
      onChange={handleChange}
      className="w-full rounded-lg border border-gray-300 px-4 py-3"
      placeholder="0000-0000-0000-0000"
    />
  </div>

  {/* Address */}
  <div>
    <label
      htmlFor="address"
      className="mb-2 block text-sm font-medium"
    >
      Address
    </label>

    <textarea
      id="address"
      name="address"
      value={form.address}
      onChange={handleChange}
      rows={3}
      className="w-full rounded-lg border border-gray-300 px-4 py-3"
      placeholder="University / Department / Office address"
    />
  </div>

  {/* Phone */}
  <div>
    <label
      htmlFor="phone"
      className="mb-2 block text-sm font-medium"
    >
      Phone Number
    </label>

    <input
      id="phone"
      name="phone"
      type="tel"
      value={form.phone}
      onChange={handleChange}
      className="w-full rounded-lg border border-gray-300 px-4 py-3"
      placeholder="+1 ..."
    />
  </div>

  {/* X Account */}
  <div>
    <label
      htmlFor="x_account"
      className="mb-2 block text-sm font-medium"
    >
      X Account
    </label>

    <input
      id="x_account"
      name="x_account"
      type="url"
      value={form.x_account}
      onChange={handleChange}
      className="w-full rounded-lg border border-gray-300 px-4 py-3"
      placeholder="https://x.com/username"
    />
  </div>
</div>

          {/* Profile Image */}
          <div>
            <label
              htmlFor="profile-image"
              className="mb-2 block text-sm font-medium"
            >
              Profile Image
            </label>

            {profile?.profile_image_url && (
              <img
                src={profile.profile_image_url}
                alt={profile.name}
                className="mb-4 h-32 w-32 rounded-full object-cover"
              />
            )}

            <input
              id="profile-image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                setImageFile(event.target.files?.[0] ?? null);
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            />

            <p className="mt-1 text-xs text-gray-500">
              PNG, JPG or WebP
            </p>
          </div>

          {/* Hero Banner */}
          <div>
            <label
              htmlFor="banner-image"
              className="mb-2 block text-sm font-medium"
            >
              Hero Banner
            </label>

            {profile?.banner_image_url && (
              <img
                src={profile.banner_image_url}
                alt="Hero Banner"
                className="mb-4 h-48 w-full rounded-xl object-cover"
              />
            )}

            <input
              id="banner-image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                setBannerFile(event.target.files?.[0] ?? null);
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            />

            <p className="mt-1 text-xs text-gray-500">
              PNG, JPG or WebP. Recommended: wide landscape image.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-black px-5 py-3 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </main>
  );
}