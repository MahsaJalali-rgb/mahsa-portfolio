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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");

    const payload = {
      title: form.title,
      authors: form.authors || null,
      journal: form.journal || null,
      year: form.year ? Number(form.year) : null,
      doi: form.doi || null,
      url: form.url || null,
      description: form.description || null,
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
    setEditingId(null);
    setSaving(false);

    await loadPublications();
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
      display_order: publication.display_order.toString(),
    });

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
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate("/admin")}
              className="mb-3 text-sm text-gray-500 hover:text-gray-900"
            >
              ← Back to dashboard
            </button>

            <h1 className="text-3xl font-bold">
              Publications
            </h1>

            <p className="mt-2 text-gray-500">
              Manage research publications.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-white"
          >
            Logout
          </button>
        </div>

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
              {editingId ? "Edit Publication" : "Add Publication"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Add a publication to the research portfolio.
            </p>
          </div>

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
              placeholder="Publication title"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Authors
            </label>

            <input
              name="authors"
              value={form.authors}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
              placeholder="John Smith, Jane Doe, ..."
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Journal / Conference
              </label>

              <input
                name="journal"
                value={form.journal}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
                placeholder="Nature Machine Intelligence"
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

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                DOI
              </label>

              <input
                name="doi"
                value={form.doi}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
                placeholder="10.1234/example"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Publication URL
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
          </div>

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

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Publication"
                  : "Add Publication"}
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

        {/* Publications list */}

        <div className="space-y-4">
          {publications.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center text-gray-500">
              No publications yet.
            </div>
          ) : (
            publications.map((publication) => (
              <article
                key={publication.id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {publication.title}
                    </h3>

                    {publication.authors && (
                      <p className="mt-2 text-sm text-gray-600">
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
                      <p className="mt-3 text-sm leading-6 text-gray-600">
                        {publication.description}
                      </p>
                    )}

                    {publication.doi && (
                      <p className="mt-3 text-sm">
                        DOI: {publication.doi}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => handleEdit(publication)}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(publication.id)}
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