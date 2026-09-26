import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../services/supabase";


type Research = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  gif_url: string | null;
  research_url: string | null;
  display_order: number;
  type: string;
};

const emptyForm = {
  title: "",
  description: "",
  research_url: "",
  display_order: 0,
  type: "research",
};

export default function AdminResearch() {
  const navigate = useNavigate();

  const [research, setResearch] = useState<Research[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [gifFile, setGifFile] = useState<File | null>(null);


  async function loadResearch() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("research")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setResearch(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/admin/login");
        return;
      }

      await loadResearch();
    }

    checkAdmin();
  }, [navigate]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: name === "display_order" ? Number(value) : value,
    }));
  }

async function uploadFile(
  file: File,
  bucket: string,
): Promise<string | null> {
  const fileExtension = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExtension}`;

  const { error } = await supabase.storage
    .from(bucket)
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
    .from(bucket)
    .getPublicUrl(fileName);

  return publicUrl;
}

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  setSaving(true);
  setError("");

  let imageUrl: string | null = null;
  let gifUrl: string | null = null;

  if (imageFile) {
    imageUrl = await uploadFile(
      imageFile,
      "research-images",
    );

    if (!imageUrl) {
      setSaving(false);
      return;
    }
  }

  if (gifFile) {
    gifUrl = await uploadFile(
      gifFile,
      "research-gifs",
    );

    if (!gifUrl) {
      setSaving(false);
      return;
    }
  }

const payload: {
  title: string;
  description: string | null;
  research_url: string | null;
  display_order: number;
  type: string;
  image_url?: string;
  gif_url?: string;
} = {
  title: form.title,
  description: form.description || null,
  research_url: form.research_url || null,
  display_order: form.display_order,
  type: form.type,
};

  if (imageUrl) {
    payload.image_url = imageUrl;
  }

  if (gifUrl) {
    payload.gif_url = gifUrl;
  }

  if (editingId) {
    const { error } = await supabase
      .from("research")
      .update(payload)
      .eq("id", editingId);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }
  } else {
    const { error } = await supabase
      .from("research")
      .insert(payload);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }
  }

  setForm(emptyForm);
  setImageFile(null);
  setGifFile(null);
  setEditingId(null);
  setSaving(false);

  await loadResearch();
}

  function handleEdit(item: Research) {
    setEditingId(item.id);

    setForm({
  title: item.title,
  description: item.description ?? "",
  research_url: item.research_url ?? "",
  display_order: item.display_order,
  type: item.type ?? "research",
});

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this research?",
    );

    if (!confirmed) {
      return;
    }

    setError("");

    const { error } = await supabase
      .from("research")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    await loadResearch();
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <button
              onClick={() => navigate("/admin")}
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              ← Back to Dashboard
            </button>

            <h1 className="mt-2 text-2xl font-bold">
              Research
            </h1>
          </div>

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate("/admin/login");
            }}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Form */}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              {editingId ? "Edit Research" : "Add Research"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Add or edit a research project.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium"
              >
                Title
              </label>

              <input
                id="title"
                name="title"
                required
                value={form.title}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                placeholder="Research title"
              />
            </div>

            <div>
  <label
    htmlFor="type"
    className="mb-2 block text-sm font-medium"
  >
    Research Type
  </label>

  <select
    id="type"
    name="type"
    value={form.type}
    onChange={handleChange}
    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
  >
    <option value="research">
      Research
    </option>

    <option value="entrepreneur">
      Entrepreneur
    </option>
  </select>
</div>

<div>
  <label
    htmlFor="image"
    className="mb-2 block text-sm font-medium"
  >
    Research Image
  </label>

  <input
    id="image"
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

<div>
  <label
    htmlFor="gif"
    className="mb-2 block text-sm font-medium"
  >
    Research GIF
  </label>

  <input
    id="gif"
    type="file"
    accept="image/gif"
    onChange={(event) => {
      setGifFile(event.target.files?.[0] ?? null);
    }}
    className="w-full rounded-lg border border-gray-300 px-4 py-3"
  />

  <p className="mt-1 text-xs text-gray-500">
    GIF animation for the research section
  </p>
</div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                rows={5}
                value={form.description}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                placeholder="Research description"
              />
            </div>

            <div>
              <label
                htmlFor="research_url"
                className="mb-2 block text-sm font-medium"
              >
                Research URL
              </label>

              <input
                id="research_url"
                name="research_url"
                type="url"
                value={form.research_url}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                placeholder="https://..."
              />
            </div>

            <div>
              <label
                htmlFor="display_order"
                className="mb-2 block text-sm font-medium"
              >
                Display Order
              </label>

              <input
                id="display_order"
                name="display_order"
                type="number"
                value={form.display_order}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Research"
                    : "Add Research"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* List */}

        <section className="mt-8">
          <div className="mb-5">
            <h2 className="text-xl font-semibold">
              Research Projects
            </h2>
          </div>

          {loading ? (
            <p className="text-gray-500">
              Loading...
            </p>
          ) : research.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center text-gray-500 shadow-sm">
              No research projects yet.
            </div>
          ) : (
            
            <div className="space-y-4">
              {research.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >
                    {(item.image_url || item.gif_url) && (
  <div className="mb-5 overflow-hidden rounded-xl">
    <img
      src={item.gif_url ?? item.image_url ?? ""}
      alt={item.title}
      className="h-48 w-full object-cover"
    />
  </div>
)}
                  <div className="flex flex-col justify-between gap-5 md:flex-row">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
  <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-500">
    #{item.display_order}
  </span>

  <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-500">
    {item.type === "entrepreneur"
      ? "Entrepreneur"
      : "Research"}
  </span>

  <h3 className="text-lg font-semibold">
    {item.title}
  </h3>
</div>

                      {item.description && (
                        <p className="mt-3 max-w-3xl text-gray-600">
                          {item.description}
                        </p>
                      )}

                      {item.research_url && (
                        <a
                          href={item.research_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-block text-sm text-blue-600 hover:underline"
                        >
                          Research Link →
                        </a>
                      )}
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}