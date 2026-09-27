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
      <main className="flex min-h-screen items-center justify-center bg-[#0b0f14] text-white">
        <p className="text-sm text-gray-400">
          Loading...
        </p>
      </main>
    );
  }

  const menuItems = [
    {
      title: "Profile",
      description:
        "Manage name, biography, contact information and profile photo.",
      path: "/admin/profile",
      label: "PROFILE",
    },
    {
      title: "Research",
      description:
        "Manage research projects, areas and research media.",
      path: "/admin/research",
      label: "RESEARCH",
    },
    {
      title: "Publications",
      description:
        "Manage papers, journals, DOI and publication links.",
      path: "/admin/publications",
      label: "PUBLICATIONS",
    },
    {
      title: "Patents",
      description:
        "Manage patents and intellectual property.",
      path: "/admin/patents",
      label: "PATENTS",
    },
    {
      title: "Team",
      description:
        "Manage team members, roles and hierarchy.",
      path: "/admin/team",
      label: "TEAM",
    },
    {
      title: "News",
      description:
        "Manage news, interviews and media coverage.",
      path: "/admin/news",
      label: "NEWS",
    },
  ];

  return (
    <main className="min-h-screen bg-[#0b0f14] text-white">

      {/* Header */}
      <header className="border-b border-white/10 bg-[#0f141b]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Portfolio Admin
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {email}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Dashboard */}
      <div className="mx-auto max-w-7xl px-6 py-12">

        {/* Page Heading */}
        <div className="mb-10">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-gray-500">
            Administration
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Dashboard
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
            Manage your portfolio content, research,
            publications, team and news from one place.
          </p>
        </div>

        {/* Management Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className="group rounded-2xl border border-white/10 bg-[#111820] p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-[#151e28] hover:shadow-2xl hover:shadow-black/20"
            >
              {/* Small Label */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium tracking-[0.25em] text-gray-600 transition-colors group-hover:text-gray-400">
                  {item.label}
                </span>

                <span className="text-gray-600 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white">
                  →
                </span>
              </div>

              {/* Title */}
              <h3 className="mt-8 text-lg font-semibold text-gray-100">
                {item.title}
              </h3>

              {/* Description */}
              <p className="mt-2 text-sm leading-6 text-gray-500 transition-colors group-hover:text-gray-400">
                {item.description}
              </p>
            </button>
          ))}
        </div>

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

