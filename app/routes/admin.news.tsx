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
  <main className="min-h-screen bg-[#0b0f14] px-6 py-10 text-white">
    <div className="mx-auto max-w-6xl">
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
            News
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Manage headline news, interviews and media coverage.
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

      {/* Add / Edit Form */}
      <section className="rounded-2xl border border-white/10 bg-[#111820] p-6 md:p-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gray-600">
              Content
            </p>

            <h2 className="mt-2 text-xl font-semibold text-gray-100">
              {editingId ? "Edit News" : "Add News"}
            </h2>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-gray-500 underline underline-offset-4 transition hover:text-white"
            >
              Cancel
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-6"
        >
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Title
            </label>

            <input
              id="title"
              type="text"
              value={form.title}
              onChange={(event) =>
                handleChange("title", event.target.value)
              }
              className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-700 focus:border-white/30"
              placeholder="News headline"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Short Description
            </label>

            <textarea
              id="description"
              value={form.description}
              onChange={(event) =>
                handleChange("description", event.target.value)
              }
              rows={3}
              className="w-full resize-y rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-700 focus:border-white/30"
              placeholder="Short summary of the news..."
            />
          </div>

          {/* Content */}
          <div>
            <label
              htmlFor="content"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Content
            </label>

            <textarea
              id="content"
              value={form.content}
              onChange={(event) =>
                handleChange("content", event.target.value)
              }
              rows={7}
              className="w-full resize-y rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-700 focus:border-white/30"
              placeholder="Full news content..."
            />
          </div>

          {/* Media */}
          <div className="space-y-6 border-t border-white/10 pt-6">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gray-600">
                Media
              </p>

              <h3 className="mt-2 text-base font-semibold text-gray-200">
                News Media
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Add an image or video URL for this news item.
              </p>
            </div>

            {/* Image */}
            <div>
              <label
                htmlFor="image_url"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Image URL
              </label>

              <input
                id="image_url"
                type="url"
                value={form.image_url}
                onChange={(event) =>
                  handleChange("image_url", event.target.value)
                }
                className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-700 focus:border-white/30"
                placeholder="https://..."
              />
            </div>

            {/* Video */}
            <div>
              <label
                htmlFor="video_url"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Video URL
              </label>

              <input
                id="video_url"
                type="url"
                value={form.video_url}
                onChange={(event) =>
                  handleChange("video_url", event.target.value)
                }
                className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-700 focus:border-white/30"
                placeholder="https://www.youtube.com/watch?v=..."
              />

              <p className="mt-2 text-xs text-gray-600">
                Optional. YouTube, Vimeo, or another video URL.
              </p>
            </div>
          </div>

          {/* Date + Type */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="news_date"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                News Date
              </label>

              <input
                id="news_date"
                type="date"
                value={form.news_date}
                onChange={(event) =>
                  handleChange("news_date", event.target.value)
                }
                className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition focus:border-white/30"
              />
            </div>

            <div>
              <label
                htmlFor="type"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Type
              </label>

              <input
                id="type"
                type="text"
                value={form.type}
                onChange={(event) =>
                  handleChange("type", event.target.value)
                }
                className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-700 focus:border-white/30"
                placeholder="Interview, Award, Media, ..."
              />
            </div>
          </div>

          {/* Source + External URL */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="source"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Source
              </label>

              <input
                id="source"
                type="text"
                value={form.source}
                onChange={(event) =>
                  handleChange("source", event.target.value)
                }
                className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-700 focus:border-white/30"
                placeholder="University News"
              />
            </div>

            <div>
              <label
                htmlFor="external_url"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                External URL
              </label>

              <input
                id="external_url"
                type="url"
                value={form.external_url}
                onChange={(event) =>
                  handleChange("external_url", event.target.value)
                }
                className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-700 focus:border-white/30"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Published */}
          <div className="border-t border-white/10 pt-6">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) =>
                  handleChange("published", event.target.checked)
                }
                className="h-4 w-4 rounded border-white/20 bg-[#0b0f14] accent-white"
              />

              <span className="text-sm font-medium text-gray-300">
                Published
              </span>

              <span className="text-xs text-gray-600">
                Show this news item on the public website
              </span>
            </label>
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          {/* Submit */}
          <div className="border-t border-white/10 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-white px-5 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update News"
                  : "Add News"}
            </button>
          </div>
        </form>
      </section>

      {/* News List */}
      <section className="mt-10">
        <div className="mb-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gray-600">
            Content Management
          </p>

          <h2 className="mt-2 text-xl font-semibold text-gray-100">
            News List
          </h2>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-[#111820] p-8">
            <p className="text-sm text-gray-500">
              Loading...
            </p>
          </div>
        ) : news.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#111820] p-8">
            <p className="text-sm text-gray-500">
              No news items yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-white/10 bg-[#111820] p-6 transition hover:border-white/15"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  {/* News Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-100">
                        {item.title}
                      </h3>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs ${
                          item.published
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                            : "border-white/10 bg-white/5 text-gray-500"
                        }`}
                      >
                        {item.published
                          ? "Published"
                          : "Draft"}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-600">
                      {item.news_date}
                      {item.type
                        ? ` • ${item.type}`
                        : ""}
                      {item.source
                        ? ` • ${item.source}`
                        : ""}
                    </p>

                    {item.description && (
                      <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-500">
                        {item.description}
                      </p>
                    )}

                    {/* Media indicators */}
                    {(item.image_url || item.video_url) && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.image_url && (
                          <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-gray-500">
                            Image
                          </span>
                        )}

                        {item.video_url && (
                          <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-gray-500">
                            Video
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => togglePublished(item)}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-400 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                    >
                      {item.published
                        ? "Unpublish"
                        : "Publish"}
                    </button>

                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-400 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
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

      {/* Footer */}
      <div className="mt-12 border-t border-white/10 pt-6">
        <p className="text-xs text-gray-600">
          Portfolio Management System
        </p>
      </div>
    </div>
  </main>
);

}