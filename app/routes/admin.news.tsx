import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../services/supabase";

type News = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  news_date: string;
  source: string | null;
  external_url: string | null;
  type: string | null;
  published: boolean;
};

const emptyForm = {
  title: "",
  description: "",
  content: "",
  image_url: "",
  video_url: "",
  news_date: new Date().toISOString().split("T")[0],
  source: "",
  external_url: "",
  type: "",
  published: true,
};

export default function AdminNews() {
  const navigate = useNavigate();

  const [news, setNews] = useState<News[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
 

  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/admin/login");
      }
    }

    checkAdmin();
  }, [navigate]);

  useEffect(() => {
    loadNews();
  }, []);

  async function loadNews() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("news")
      .select(
  "id, title, description, content, image_url, video_url, news_date, source, external_url, type, published",
)
      .order("news_date", { ascending: false });

    if (error) {
      console.error("Failed to load news:", error);
      setError(error.message);
      setLoading(false);
      return;
    }

    setNews(data ?? []);
    setLoading(false);
  }

  function handleChange(
    field: keyof typeof emptyForm,
    value: string | boolean,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function startEdit(item: News) {
    setEditingId(item.id);

    setForm({
  title: item.title,
  description: item.description ?? "",
  content: item.content ?? "",
  image_url: item.image_url ?? "",
  video_url: item.video_url ?? "",
  news_date: item.news_date,
  source: item.source ?? "",
  external_url: item.external_url ?? "",
  type: item.type ?? "",
  published: item.published,
});

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
  title: form.title.trim(),
  description: form.description.trim() || null,
  content: form.content.trim() || null,
  image_url: form.image_url.trim() || null,
  video_url: form.video_url.trim() || null,
  news_date: form.news_date,
  source: form.source.trim() || null,
  external_url: form.external_url.trim() || null,
  type: form.type.trim() || null,
  published: form.published,
};

    if (editingId) {
      const { error } = await supabase
        .from("news")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        console.error("Failed to update news:", error);
        setError(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("news")
        .insert(payload);

      if (error) {
        console.error("Failed to create news:", error);
        setError(error.message);
        setSaving(false);
        return;
      }
    }

    resetForm();
    await loadNews();

    setSaving(false);
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this news item?",
    );

    if (!confirmed) {
      return;
    }

    setError("");

    const { error } = await supabase
      .from("news")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete news:", error);
      setError(error.message);
      return;
    }

    await loadNews();
  }

  async function togglePublished(item: News) {
    setError("");

    const { error } = await supabase
      .from("news")
      .update({
        published: !item.published,
      })
      .eq("id", item.id);

    if (error) {
      setError(error.message);
      return;
    }

    await loadNews();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/admin/login");
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">
              News
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage headline news, interviews and media coverage.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-100"
          >
            Logout
          </button>
        </div>

        {/* Form */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {editingId ? "Edit News" : "Add News"}
            </h2>

            {editingId && (
              <button
                onClick={resetForm}
                className="text-sm text-gray-500 underline"
              >
                Cancel
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-5"
          >
            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Title
              </label>

              <input
                type="text"
                value={form.title}
                onChange={(event) =>
                  handleChange("title", event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
                placeholder="News headline"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Short Description
              </label>

              <textarea
                value={form.description}
                onChange={(event) =>
                  handleChange("description", event.target.value)
                }
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </div>

            {/* Content */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Content
              </label>

              <textarea
                value={form.content}
                onChange={(event) =>
                  handleChange("content", event.target.value)
                }
                rows={7}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
                placeholder="Full news content..."
              />
            </div>

            {/* Image */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Image URL
              </label>

              <input
                type="text"
                value={form.image_url}
                onChange={(event) =>
                  handleChange("image_url", event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
                placeholder="https://..."
              />
            </div>
            <div>
  <label className="mb-2 block text-sm font-medium">
    Video URL
  </label>

  <input
    type="url"
    value={form.video_url}
    onChange={(event) =>
      handleChange("video_url", event.target.value)
    }
    className="w-full rounded-lg border border-gray-300 px-4 py-3"
    placeholder="https://www.youtube.com/watch?v=..."
  />

  <p className="mt-1 text-xs text-gray-500">
    Optional. YouTube, Vimeo, or another video URL.
  </p>
</div>

            {/* Date + Type */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  News Date
                </label>

                <input
                  type="date"
                  value={form.news_date}
                  onChange={(event) =>
                    handleChange("news_date", event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Type
                </label>

                <input
                  type="text"
                  value={form.type}
                  onChange={(event) =>
                    handleChange("type", event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  placeholder="Interview, Award, Media, ..."
                />
              </div>
            </div>

            {/* Source + URL */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Source
                </label>

                <input
                  type="text"
                  value={form.source}
                  onChange={(event) =>
                    handleChange("source", event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  placeholder="University News"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  External URL
                </label>

                <input
                  type="text"
                  value={form.external_url}
                  onChange={(event) =>
                    handleChange("external_url", event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Published */}
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) =>
                  handleChange("published", event.target.checked)
                }
                className="h-4 w-4"
              />

              <span className="text-sm font-medium">
                Published
              </span>
            </label>

            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update News"
                  : "Add News"}
            </button>
          </form>
        </section>

        {/* News List */}
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">
            News List
          </h2>

          {loading ? (
            <p className="text-sm text-gray-500">
              Loading...
            </p>
          ) : news.length === 0 ? (
            <p className="text-sm text-gray-500">
              No news items yet.
            </p>
          ) : (
            <div className="space-y-4">
              {news.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold">
                          {item.title}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            item.published
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.published
                            ? "Published"
                            : "Draft"}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-gray-500">
                        {item.news_date}
                        {item.type
                          ? ` • ${item.type}`
                          : ""}
                        {item.source
                          ? ` • ${item.source}`
                          : ""}
                      </p>

                      {item.description && (
                        <p className="mt-3 text-sm leading-6 text-gray-600">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          togglePublished(item)
                        }
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        {item.published
                          ? "Unpublish"
                          : "Publish"}
                      </button>

                      <button
                        onClick={() => startEdit(item)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(item.id)
                        }
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
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