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
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}

        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate("/admin")}
              className="mb-3 text-sm text-gray-500 hover:text-gray-900"
            >
              ← Back to dashboard
            </button>

            <h1 className="text-3xl font-bold">
              Patents
            </h1>

            <p className="mt-2 text-gray-500">
              Manage patents and intellectual property.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-white"
          >
            Logout
          </button>
        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="mb-10 space-y-5 rounded-2xl bg-white p-8 shadow-sm"
        >
          <div>
            <h2 className="text-xl font-semibold">
              {editingId ? "Edit Patent" : "Add Patent"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Add a patent to the research portfolio.
            </p>
          </div>

          {/* Title */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Title
            </label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
              placeholder="Patent title"
            />
          </div>

          {/* Inventors */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Inventors
            </label>

            <input
              name="inventors"
              value={form.inventors}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
              placeholder="John Smith, Jane Doe, ..."
            />
          </div>

          {/* Patent number + Year */}

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Patent Number
              </label>

              <input
                name="patent_number"
                value={form.patent_number}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
                placeholder="US12345678"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Year
              </label>

              <input
                name="year"
                type="number"
                value={form.year}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
                placeholder="2026"
              />
            </div>
          </div>

          {/* URL */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Patent URL
            </label>

            <input
              name="url"
              type="url"
              value={form.url}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
              placeholder="https://..."
            />
          </div>

          {/* Description */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
              placeholder="Short description..."
            />
          </div>

          {/* Display Order */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Display Order
            </label>

            <input
              name="display_order"
              type="number"
              value={form.display_order}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            />
          </div>

          {/* Buttons */}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
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
                className="rounded-lg border border-gray-300 px-6 py-3 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Patent list */}

        <div className="space-y-4">
          {patents.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center text-gray-500">
              No patents yet.
            </div>
          ) : (
            patents.map((patent) => (
              <article
                key={patent.id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {patent.title}
                    </h3>

                    {patent.inventors && (
                      <p className="mt-2 text-sm text-gray-600">
                        {patent.inventors}
                      </p>
                    )}

                    <div className="mt-2 text-sm text-gray-500">
                      {patent.patent_number && (
                        <span>{patent.patent_number}</span>
                      )}

                      {patent.year && (
                        <span> · {patent.year}</span>
                      )}
                    </div>

                    {patent.description && (
                      <p className="mt-3 text-sm leading-6 text-gray-600">
                        {patent.description}
                      </p>
                    )}

                    {patent.url && (
                      <a
                        href={patent.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block text-sm font-medium underline underline-offset-4"
                      >
                        View Patent
                      </a>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => handleEdit(patent)}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(patent.id)}
                      className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  );
}