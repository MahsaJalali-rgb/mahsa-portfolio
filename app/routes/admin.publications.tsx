import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { ChangeEvent, FormEvent } from "react";
import { supabase } from "../services/supabase";

type Publication = {
  id: string;
  title: string;
  authors: string | null;
  journal: string | null;
  year: number | null;
  doi: string | null;
  url: string | null;
  description: string | null;
  image_url: string | null;
  display_order: number;
};

const emptyForm = {
  title: "",
  authors: "",
  journal: "",
  year: "",
  doi: "",
  url: "",
  description: "",
  image_url: "",
  display_order: "0",
};

export default function AdminPublications() {
  const navigate = useNavigate();

  const [publications, setPublications] = useState<Publication[]>([]);
  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUploading, setImageUploading] = useState(false);  

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/admin/login");
        return;
      }

      await loadPublications();
    }

    checkUser();
  }, [navigate]);

  async function loadPublications() {
    const { data, error } = await supabase
      .from("publications")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setPublications(data ?? []);
    setLoading(false);
  }

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }
  async function uploadPublicationImage(file: File) {
  setImageUploading(true);

  const fileExtension = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExtension}`;

  const filePath = fileName;

  const { error: uploadError } = await supabase.storage
    .from("publication-images")
    .upload(filePath, file, {
      upsert: false,
    });

  if (uploadError) {
    setImageUploading(false);
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("publication-images")
    .getPublicUrl(filePath);

  setImageUploading(false);

  return publicUrl;
}

async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  setSaving(true);
  setError("");

  let imageUrl = form.image_url || null;

  try {
    if (imageFile) {
      imageUrl = await uploadPublicationImage(imageFile);
    }

    const payload = {
      title: form.title,
      authors: form.authors || null,
      journal: form.journal || null,
      year: form.year ? Number(form.year) : null,
      doi: form.doi || null,
      url: form.url || null,
      description: form.description || null,
      image_url: imageUrl,
      display_order: Number(form.display_order) || 0,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { error } = await supabase
        .from("publications")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("publications")
        .insert(payload);

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    }

    setForm(emptyForm);
    setImageFile(null);
    setEditingId(null);
    setSaving(false);

    await loadPublications();
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "Failed to upload publication image.",
    );
    setSaving(false);
  }
}

  function handleEdit(publication: Publication) {
    setEditingId(publication.id);

    setForm({
  title: publication.title,
  authors: publication.authors ?? "",
  journal: publication.journal ?? "",
  year: publication.year?.toString() ?? "",
  doi: publication.doi ?? "",
  url: publication.url ?? "",
  description: publication.description ?? "",
  image_url: publication.image_url ?? "",
  display_order: publication.display_order.toString(),
});
setImageFile(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this publication?",
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("publications")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    await loadPublications();
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
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
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate("/admin")}
            className="mb-3 text-sm text-gray-500 transition hover:text-white"
          >
            ← Back to dashboard
          </button>

          <p className="text-xs font-medium uppercase tracking-[0.3em] text-gray-600">
            Administration
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Publications
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage research publications.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          Logout
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-10 space-y-5 rounded-2xl border border-white/10 bg-[#111820] p-8"
      >
        <div className="border-b border-white/10 pb-5">
          <h2 className="text-xl font-semibold text-white">
            {editingId ? "Edit Publication" : "Add Publication"}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Add a publication to the research portfolio.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Title
          </label>

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-white/30"
            placeholder="Publication title"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Authors
          </label>

          <input
            name="authors"
            value={form.authors}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-white/30"
            placeholder="John Smith, Jane Doe, ..."
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Journal / Conference
            </label>

            <input
              name="journal"
              value={form.journal}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-white/30"
              placeholder="Nature Machine Intelligence"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Year
            </label>

            <input
              name="year"
              type="number"
              value={form.year}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-white/30"
              placeholder="2026"
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              DOI
            </label>

            <input
              name="doi"
              value={form.doi}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-white/30"
              placeholder="10.1234/example"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Publication URL
            </label>

            <input
              name="url"
              type="url"
              value={form.url}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-white/30"
              placeholder="https://..."
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Description
          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-white/30"
            placeholder="Short description..."
          />
        </div>

        <div>
  <label className="mb-2 block text-sm font-medium text-gray-300">
    Publication Image
  </label>

  <input
    type="file"
    accept="image/*"
    onChange={(event) => {
      setImageFile(event.target.files?.[0] ?? null);
    }}
    className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-sm text-gray-300 outline-none transition file:mr-4 file:rounded-md file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-900 hover:border-white/20"
  />

  <p className="mt-2 text-xs text-gray-600">
    Upload an image for this publication.
  </p>

  {form.image_url && !imageFile && (
    <div className="mt-4">
      <img
        src={form.image_url}
        alt="Current publication"
        className="h-32 w-48 rounded-xl object-cover"
      />
    </div>
  )}

  {imageFile && (
    <p className="mt-2 text-xs text-gray-500">
      Selected: {imageFile.name}
    </p>
  )}
</div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Display Order
          </label>

          <input
            name="display_order"
            type="number"
            value={form.display_order}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-white/30"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || imageUploading}
            className="rounded-lg bg-white px-6 py-3 font-medium text-gray-900 transition hover:bg-gray-200 disabled:opacity-50"
          >
            {saving || imageUploading
              ? "Saving..."
              : editingId
                ? "Update Publication"
                : "Add Publication"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="rounded-lg border border-white/10 bg-white/5 px-6 py-3 font-medium text-gray-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Publications list */}
      <div className="space-y-4">
        {publications.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#111820] p-8 text-center text-gray-500">
            No publications yet.
          </div>
        ) : (
          publications.map((publication) => (

<article
  key={publication.id}
  className="rounded-2xl border border-white/10 bg-[#111820] p-6 transition hover:border-white/15"
>
  <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
    <div className="flex min-w-0 flex-1 flex-col gap-5 sm:flex-row">
      {publication.image_url && (
        <div className="shrink-0">
          <img
            src={publication.image_url}
            alt={publication.title}
            className="h-28 w-full rounded-xl object-cover sm:h-24 sm:w-32"
          />
        </div>
      )}

      <div className="min-w-0">
        <h3 className="text-lg font-semibold text-gray-100">
          {publication.title}
        </h3>

        {publication.authors && (
          <p className="mt-2 text-sm text-gray-400">
            {publication.authors}
          </p>
        )}

        <div className="mt-2 text-sm text-gray-500">
          {publication.journal && (
            <span>{publication.journal}</span>
          )}

          {publication.year && (
            <span> · {publication.year}</span>
          )}
        </div>

        {publication.description && (
          <p className="mt-3 text-sm leading-6 text-gray-400">
            {publication.description}
          </p>
        )}

        {publication.doi && (
          <p className="mt-3 text-sm text-gray-500">
            <span className="text-gray-400">DOI:</span>{" "}
            {publication.doi}
          </p>
        )}
      </div>
    </div>

    <div className="flex shrink-0 gap-2">
      <button
        type="button"
        onClick={() => handleEdit(publication)}
        className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
      >
        Edit
      </button>

      <button
        type="button"
        onClick={() => handleDelete(publication.id)}
        className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/20"
      >
        Delete
      </button>
    </div>
  </div>
</article>

          ))
        )}
      </div>

      <div className="mt-12 border-t border-white/10 pt-6">
        <p className="text-xs text-gray-600">
          Portfolio Management System
        </p>
      </div>
    </div>
  </main>
);
}