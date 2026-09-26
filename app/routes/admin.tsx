import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../services/supabase";

export default function Admin() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/admin/login");
        return;
      }

      setEmail(user.email ?? "");
      setLoading(false);
    }

    checkUser();
  }, [navigate]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/admin/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-bold">
              Portfolio Admin
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {email}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <h2 className="text-3xl font-bold">
          Dashboard
        </h2>

        <p className="mt-2 text-gray-600">
          Manage your portfolio content.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
  <button
    onClick={() => navigate("/admin/research")}
    className="rounded-2xl bg-white p-6 text-left shadow-sm transition hover:shadow-md"
  >
    <h3 className="text-lg font-semibold">
      Research
    </h3>

    <p className="mt-2 text-sm text-gray-500">
      Manage research projects.
    </p>
  </button>
  <button
  onClick={() => navigate("/admin/profile")}
  className="rounded-2xl bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
>
  <h2 className="text-lg font-semibold">
    Profile
  </h2>

  <p className="mt-2 text-sm text-gray-500">
    Manage name, biography, contact information and profile photo.
  </p>
</button>

<button
  onClick={() => navigate("/admin/publications")}
  className="rounded-2xl bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
>
  <h2 className="text-lg font-semibold">
    Publications
  </h2>

  <p className="mt-2 text-sm text-gray-500">
    Manage papers, journals, DOI and publication links.
  </p>
</button>

<button
  onClick={() => navigate("/admin/patents")}
  className="rounded-2xl bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
>
  <h2 className="text-lg font-semibold">
    Patents
  </h2>

  <p className="mt-2 text-sm text-gray-500">
    Manage patents and intellectual property.
  </p>
</button>

<button
  onClick={() => navigate("/admin/team")}
  className="rounded-2xl bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
>
  <h2 className="text-lg font-semibold">
    Team
  </h2>

  <p className="mt-2 text-sm text-gray-500">
    Manage team members, roles and hierarchy.
  </p>
</button>
<button
  onClick={() => navigate("/admin/news")}
  className="rounded-2xl bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
>
  <h2 className="text-lg font-semibold">
    News
  </h2>

  <p className="mt-2 text-sm text-gray-500">
    Manage news, interviews and media coverage.
  </p>
</button>

    
        </div>
        </div>
      </div>
    </main>
  );
}