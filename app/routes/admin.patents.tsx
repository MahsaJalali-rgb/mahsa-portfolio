import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { ChangeEvent, FormEvent } from "react";
import { supabase } from "../services/supabase";

type Patent = {
  id: string;
  title: string;
  inventors: string | null;
  patent_number: string | null;
  year: number | null;
  url: string | null;
  description: string | null;
  display_order: number;
};

const emptyForm = {
  title: "",
  inventors: "",
  patent_number: "",
  year: "",
  url: "",
  description: "",
  display_order: "0",
};

export default function AdminPatents() {
  const navigate = useNavigate();

  const [patents, setPatents] = useState<Patent[]>([]);
  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/admin/login");
        return;
      }

      await loadPatents();
    }

    checkUser();
  }, [navigate]);

  async function loadPatents() {
    const { data, error } = await supabase
      .from("patents")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setPatents(data ?? []);
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");

    if (!form.title.trim()) {
      setError("Patent title is required.");
      setSaving(false);
      return;
    }

    const payload = {
      title: form.title.trim(),
      inventors: form.inventors.trim() || null,
      patent_number: form.patent_number.trim() || null,
      year: form.year ? Number(form.year) : null,
      url: form.url.trim() || null,
      description: form.description.trim() || null,
      display_order: Number(form.display_order) || 0,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { error } = await supabase
        .from("patents")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("patents")
        .insert(payload);

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    }

    setForm(emptyForm);
    setEditingId(null);
    setSaving(false);

    await loadPatents();
  }

  function handleEdit(patent: Patent) {
    setEditingId(patent.id);

    setForm({
      title: patent.title,
      inventors: patent.inventors ?? "",
      patent_number: patent.patent_number ?? "",
      year: patent.year?.toString() ?? "",
      url: patent.url ?? "",
      description: patent.description ?? "",
      display_order: patent.display_order.toString(),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this patent?",
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("patents")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    await loadPatents();
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
            Patents
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Manage patents and intellectual property.
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

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-10 space-y-7 rounded-2xl border border-white/10 bg-[#111820] p-6 md:p-8"
      >
        {/* Form Header */}
        <div className="border-b border-white/10 pb-6">
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gray-600">
            Intellectual Property
          </p>

          <h2 className="mt-2 text-xl font-semibold text-gray-100">
            {editingId ? "Edit Patent" : "Add Patent"}
          </h2>

          <p className="mt-1 text-sm leading-6 text-gray-500">
            Add a patent to the research portfolio.
          </p>
        </div>

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
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-700 focus:border-white/30"
            placeholder="Patent title"
          />
        </div>

        {/* Inventors */}
        <div>
          <label
            htmlFor="inventors"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Inventors
          </label>

          <input
            id="inventors"
            name="inventors"
            value={form.inventors}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-700 focus:border-white/30"
            placeholder="John Smith, Jane Doe, ..."
          />
        </div>

        {/* Patent Number + Year */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="patent_number"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Patent Number
            </label>

            <input
              id="patent_number"
              name="patent_number"
              value={form.patent_number}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-700 focus:border-white/30"
              placeholder="US12345678"
            />
          </div>

          <div>
            <label
              htmlFor="year"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Year
            </label>

            <input
              id="year"
              name="year"
              type="number"
              value={form.year}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-700 focus:border-white/30"
              placeholder="2026"
            />
          </div>
        </div>

        {/* Patent URL */}
        <div>
          <label
            htmlFor="url"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Patent URL
          </label>

          <input
            id="url"
            name="url"
            type="url"
            value={form.url}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-700 focus:border-white/30"
            placeholder="https://..."
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Description
          </label>

          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full resize-y rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-700 focus:border-white/30"
            placeholder="Short description..."
          />
        </div>

        {/* Display Order */}
        <div>
          <label
            htmlFor="display_order"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Display Order
          </label>

          <input
            id="display_order"
            name="display_order"
            type="number"
            value={form.display_order}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-700 focus:border-white/30"
          />

          <p className="mt-2 text-xs text-gray-600">
            Higher values can be used to prioritize patents on the
            public website.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3 border-t border-white/10 pt-6">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-white px-6 py-3 font-medium text-gray-900 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : editingId
                ? "Update Patent"
                : "Add Patent"}
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

      {/* Patent List */}
      <section>
        <div className="mb-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gray-600">
            Content Management
          </p>

          <h2 className="mt-2 text-xl font-semibold text-gray-100">
            Patent List
          </h2>
        </div>

        {patents.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#111820] p-8 text-center">
            <p className="text-sm text-gray-500">
              No patents yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {patents.map((patent) => (
              <article
                key={patent.id}
                className="rounded-2xl border border-white/10 bg-[#111820] p-6 transition hover:border-white/15"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  {/* Patent Information */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-100">
                        {patent.title}
                      </h3>

                      {patent.year && (
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-500">
                          {patent.year}
                        </span>
                      )}
                    </div>

                    {patent.inventors && (
                      <p className="mt-3 text-sm leading-6 text-gray-400">
                        {patent.inventors}
                      </p>
                    )}

                    {patent.patent_number && (
                      <p className="mt-2 text-xs font-medium uppercase tracking-[0.15em] text-gray-600">
                        Patent No. {patent.patent_number}
                      </p>
                    )}

                    {patent.description && (
                      <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-500">
                        {patent.description}
                      </p>
                    )}

                    {patent.url && (
                      <a
                        href={patent.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block text-sm font-medium text-gray-400 underline underline-offset-4 transition hover:text-white"
                      >
                        View Patent →
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(patent)}
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-400 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(patent.id)}
                      className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2 text-sm text-red-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
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