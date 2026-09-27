import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import {
  Hash,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";


type Research = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  gif_url: string | null;
  research_url: string | null;
  display_order: number;
};

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
  created_at?: string;
  updated_at?: string;
};


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

type TeamRole = {
  id: string;
  name: string;
  display_order: number;
};

type TeamMember = {
  id: string;
  name: string;
  position: string | null;
  role_id: string | null;
  photo_url: string | null;
  email: string | null;
  linkedin: string | null;
  bio: string | null;
  display_order: number;
  active: boolean;
  joined_at: string | null;
  team_roles: TeamRole[];
};

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

export default function Home() {
const [research, setResearch] = useState<Research[]>([]);
const [loadingResearch, setLoadingResearch] = useState(true);
const [showAllResearch, setShowAllResearch] = useState(false);
const [profile, setProfile] = useState<Profile | null>(null);
const [loadingProfile, setLoadingProfile] = useState(true);
const [publications, setPublications] = useState<Publication[]>([]);
const [loadingPublications, setLoadingPublications] = useState(true);
const [patents, setPatents] = useState<Patent[]>([]);
const [loadingPatents, setLoadingPatents] = useState(true);
const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
const [news, setNews] = useState<News[]>([]);
const [loadingNews, setLoadingNews] = useState(true);
const [isScrolled, setIsScrolled] = useState(false);
const [showAllPublications, setShowAllPublications] = useState(false);
const [showAllPatents, setShowAllPatents] = useState(false);
const [showAllNews, setShowAllNews] = useState(false);
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

useEffect(() => {
  function handleScroll() {
    setIsScrolled(window.scrollY > 50);
  }

  window.addEventListener("scroll", handleScroll);

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, []);

useEffect(() => {
  async function loadNews() {
    const { data, error } = await supabase
      .from("news")
      .select(
  "id, title, description, content, image_url, video_url, news_date, source, external_url, type, published",
)
      .eq("published", true)
      .order("news_date", { ascending: false });

    if (error) {
      console.error("Failed to load news:", error);
      setLoadingNews(false);
      return;
    }

    setNews(data ?? []);
    setLoadingNews(false);
  }

  loadNews();
}, []);


useEffect(() => {
  async function loadTeamMembers() {
    const { data, error } = await supabase
      .from("team_members")
      .select(`
        id,
        name,
        position,
        role_id,
        photo_url,
        email,
        linkedin,
        bio,
        display_order,
        active,
        joined_at,
        team_roles (
          id,
          name,
          display_order
        )
      `)
      .eq("active", true);

    if (error) {
      console.error("Failed to load team members:", error);
      return;
    }

    const members = (data ?? []) as TeamMember[];

const sortedMembers = members.sort((a, b) => {
  const roleA = a.team_roles[0]?.display_order ?? 999;
  const roleB = b.team_roles[0]?.display_order ?? 999;

  if (roleA !== roleB) {
    return roleA - roleB;
  }

  return a.display_order - b.display_order;
});
    setTeamMembers(sortedMembers);
  }

  loadTeamMembers();
}, []);

useEffect(() => {
  async function loadPatents() {
    const { data, error } = await supabase
      .from("patents")
      .select(
        "id, title, inventors, patent_number, year, url, description, display_order",
      )
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Failed to load patents:", error);
      setLoadingPatents(false);
      return;
    }

    setPatents(data ?? []);
    setLoadingPatents(false);
  }

  loadPatents();
}, []);

useEffect(() => {
  async function loadPublications() {
    const { data, error } = await supabase
      .from("publications")
      .select(
        "id, title, authors, journal, year, doi, url, description, image_url, display_order",
      )
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Failed to load publications:", error);
      setLoadingPublications(false);
      return;
    }

    setPublications(data ?? []);
    setLoadingPublications(false);
  }

  loadPublications();
}, []);


useEffect(() => {
  async function loadProfile() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Failed to load profile:", error);
      setLoadingProfile(false);
      return;
    }

    setProfile(data);
    setLoadingProfile(false);
  }

  loadProfile();
}, []);

useEffect(() => {
  async function loadResearch() {
    const { data, error } = await supabase
      .from("research")
      .select(
        "id, title, description, image_url, gif_url, research_url, display_order",
      )
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Failed to load research:", error);
      setLoadingResearch(false);
      return;
    }

    setResearch(data ?? []);
    setLoadingResearch(false);
  }

  loadResearch();
}, []);

  return (
    <main className="min-h-screen bg-white text-gray-900">

<nav
  className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
    isScrolled ? "pt-4" : "pt-4"
  }`}
>
  <div className="mx-auto max-w-7xl px-4 sm:px-6">
    <div
      className={`rounded-2xl px-4 transition-all duration-300 md:px-5 ${
        isScrolled
          ? "border border-white/10 bg-black/30 backdrop-blur-md" 
          : "border border-gray-200 bg-white/40 shadow-sm backdrop-blur-md"
      }`}
    >
      {/* Main Navbar Row */}
      <div className="flex h-16 items-center justify-between">

        {/* Logo / Name */}
        <a
          href="#home"
          onClick={() => setMobileMenuOpen(false)}
          className={`max-w-[55%] truncate text-sm font-semibold tracking-tight transition-colors duration-300 ${
            isScrolled ? "text-black-900" : "text-white"
          }`}
        >
          {profile?.name ?? "Professor Name"}
        </a>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#about"
            className={`text-sm transition-colors duration-300 ${
              isScrolled
                ? "text-gray-700 hover:text-gray-950"
                : "text-gray-300 hover:text-white"
            }`}
          >
            About
          </a>

          <a
            href="#research"
            className={`text-sm transition-colors duration-300 ${
              isScrolled
                ? "text-gray-700 hover:text-gray-950"
                : "text-gray-300 hover:text-white"
            }`}
          >
            Research
          </a>

          <a
            href="#publications"
            className={`text-sm transition-colors duration-300 ${
              isScrolled
                ? "text-gray-700 hover:text-gray-950"
                : "text-gray-300 hover:text-white"
            }`}
          >
            Publications
          </a>

          <a
            href="#patents"
            className={`text-sm transition-colors duration-300 ${
              isScrolled
                ? "text-gray-700 hover:text-gray-950"
                : "text-gray-300 hover:text-white"
            }`}
          >
            Patents
          </a>

          <a
            href="#team"
            className={`text-sm transition-colors duration-300 ${
              isScrolled
                ? "text-gray-700 hover:text-gray-950"
                : "text-gray-300 hover:text-white"
            }`}
          >
            Team
          </a>

          <a
            href="#news"
            className={`text-sm transition-colors duration-300 ${
              isScrolled
                ? "text-gray-700 hover:text-gray-950"
                : "text-gray-300 hover:text-white"
            }`}
          >
            News
          </a>
        </div>

        {/* Desktop Contact */}
        <a
          href="#contact"
          className={`hidden rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 md:block ${
            isScrolled
              ? "bg-gray-900 text-white hover:bg-gray-800"
              : "bg-white text-gray-900 hover:bg-gray-100"
          }`}
        >
          Contact
        </a>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() =>
            setMobileMenuOpen((current) => !current)
          }
          aria-label={
            mobileMenuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={mobileMenuOpen}
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300 md:hidden ${
            isScrolled
              ? "text-gray-900 hover:bg-gray-100"
              : "text-white hover:bg-white/10"
          }`}
        >
          {mobileMenuOpen ? (
            <span className="text-2xl font-light leading-none">
              ×
            </span>
          ) : (
            <span className="flex flex-col gap-1.5">
              <span
                className={`block h-px w-5 ${
                  isScrolled
                    ? "bg-gray-900"
                    : "bg-white"
                }`}
              />
              <span
                className={`block h-px w-5 ${
                  isScrolled
                    ? "bg-gray-900"
                    : "bg-white"
                }`}
              />
              <span
                className={`block h-px w-5 ${
                  isScrolled
                    ? "bg-gray-900"
                    : "bg-white"
                }`}
              />
            </span>
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div
          className={`border-t py-4 md:hidden ${
            isScrolled
              ? "border-gray-200"
              : "border-white/10"
          }`}
        >
          <div className="flex flex-col">

            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className={`border-b py-3 text-sm transition-colors ${
                isScrolled
                  ? "border-gray-100 text-gray-700 hover:text-black"
                  : "border-white/10 text-gray-300 hover:text-white"
              }`}
            >
              About
            </a>

            <a
              href="#research"
              onClick={() => setMobileMenuOpen(false)}
              className={`border-b py-3 text-sm transition-colors ${
                isScrolled
                  ? "border-gray-100 text-gray-700 hover:text-black"
                  : "border-white/10 text-gray-300 hover:text-white"
              }`}
            >
              Research
            </a>

            <a
              href="#publications"
              onClick={() => setMobileMenuOpen(false)}
              className={`border-b py-3 text-sm transition-colors ${
                isScrolled
                  ? "border-gray-100 text-gray-700 hover:text-black"
                  : "border-white/10 text-gray-300 hover:text-white"
              }`}
            >
              Publications
            </a>

            <a
              href="#patents"
              onClick={() => setMobileMenuOpen(false)}
              className={`border-b py-3 text-sm transition-colors ${
                isScrolled
                  ? "border-gray-100 text-gray-700 hover:text-black"
                  : "border-white/10 text-gray-300 hover:text-white"
              }`}
            >
              Patents
            </a>

            <a
              href="#team"
              onClick={() => setMobileMenuOpen(false)}
              className={`border-b py-3 text-sm transition-colors ${
                isScrolled
                  ? "border-gray-100 text-gray-700 hover:text-black"
                  : "border-white/10 text-gray-300 hover:text-white"
              }`}
            >
              Team
            </a>

            <a
              href="#news"
              onClick={() => setMobileMenuOpen(false)}
              className={`border-b py-3 text-sm transition-colors ${
                isScrolled
                  ? "border-gray-100 text-gray-700 hover:text-black"
                  : "border-white/10 text-gray-300 hover:text-white"
              }`}
            >
              News
            </a>

            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className={`mt-3 rounded-full px-4 py-2.5 text-center text-sm font-medium transition-all ${
                isScrolled
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "bg-white text-gray-900 hover:bg-gray-100"
              }`}
            >
              Contact
            </a>

          </div>
        </div>
      )}
    </div>
  </div>
</nav>

{/* Hero */}
<section
  id="home"
  className="relative flex min-h-screen w-full items-end overflow-hidden bg-gray-950 text-white"
>
  {/* Banner Image */}
  {profile?.banner_image_url && (
    <img
      src={profile.banner_image_url}
      alt=""
      className="absolute inset-0 z-0 h-full w-full object-cover"
    />
  )}

  {/* Gradient Overlay */}
  <div className="absolute inset-0 z-10 bg-linear-to-t from-black/85 via-black/40 to-black/10" />

  {/* Hero Content */}
  <div className="relative z-20 mx-auto w-full max-w-7xl px-6 pb-20 md:px-10 md:pb-24 lg:pb-28">
    <div className="max-w-4xl">
      {/* Small Label */}
      <p className="mb-5 text-xs font-medium uppercase tracking-[0.3em] text-white/60 md:text-sm">
        Researcher & Professor
      </p>

      {/* Name */}
      <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl lg:text-8xl">
        {loadingProfile ? "Loading..." : profile?.name}
      </h1>

      {/* Position */}
      {profile?.position && (
        <p className="mt-6 max-w-2xl text-xl font-light leading-relaxed text-white/85 md:text-2xl">
          {profile.position}
        </p>
      )}

      {/* Research Field */}
      {profile?.field && (
        <p className="mt-2 max-w-2xl text-base text-white/60 md:text-lg">
          {profile.field}
        </p>
      )}

      {/* Bottom Row */}
      <div className="mt-9 flex flex-wrap items-center gap-4">
        {/* Email */}
        {profile?.email && (
          <a
            href={`mailto:${profile.email}`}
            className="rounded-full bg-white px-6 py-3 text-sm font-medium text-gray-900 transition hover:bg-white/85"
          >
            Get in touch
          </a>
        )}

        {/* Research */}
        <a
          href="#research"
          className="rounded-full border border-white/30 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:border-white/60 hover:bg-white/10"
        >
          Explore research
        </a>

        {/* LinkedIn */}
        {profile?.linkedin && (
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            className="px-2 py-3 text-sm text-white/65 transition hover:text-white"
          >
            LinkedIn →
          </a>
        )}
      </div>
    </div>
  </div>

  {/* Scroll Indicator */}
  <a
    href="#about"
    className="absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/50 transition hover:text-white md:flex"
  >
    <span className="text-[10px] uppercase tracking-[0.3em]">
      Scroll
    </span>

    <span className="h-8 w-px bg-white/40" />
  </a>
</section>

      {/* Biography */}
  <section id="about" className="px-6 py-24 md:py-32">
  <div className="mx-auto max-w-7xl">
    {/* Biography Frame */}
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
      <div className="grid md:grid-cols-2 md:items-stretch">
        
        {/* Profile Image */}
        <div className="p-6 md:p-8">
          {profile?.profile_image_url ? (
            <img
              src={profile.profile_image_url}
              alt={profile.name}
              className="h-full min-h-[420px] w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="flex min-h-[420px] items-center justify-center rounded-2xl bg-gray-100 text-sm text-gray-400">
              No profile image
            </div>
          )}
        </div>

        {/* Biography Content */}
        <div className="flex flex-col justify-center px-6 py-10 md:px-10 lg:px-14">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-gray-400">
            Biography
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
            {profile?.name}
          </h2>

          {profile?.position && (
            <p className="mt-3 text-base text-gray-500">
              {profile.position}
            </p>
          )}

          <div className="my-7 h-px w-12 bg-gray-300" />

          {profile?.bio && (
            <p className="max-w-2xl whitespace-pre-line text-base leading-8 text-gray-600 md:text-lg">
              {profile.bio}
            </p>
          )}
        </div>

      </div>
    </div>
  </div>
</section>

      {/* Research */}
<section id="research" className="px-6 py-24 md:py-32">
  <div className="mx-auto max-w-7xl">
    {/* Section Header */}
    <div className="mb-12">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-gray-400">
        Research
      </p>

      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
        Research Areas
      </h2>
    </div>

    {loadingResearch ? (
      <p className="text-gray-500">Loading research...</p>
    ) : research.length === 0 ? (
      <p className="text-gray-500">
        No research projects available.
      </p>
    ) : (
      <>
        {/* Research Grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[...research]
            .sort(
              (a, b) =>
                b.display_order - a.display_order,
            )
            .map((item, index) => {
              const isHidden = index >= 3;

              return (
                <article
                  key={item.id}
                  className={`research-card overflow-hidden rounded-2xl bg-gray-900 transition-all duration-300 hover:bg-gray-800 ${
                    isHidden
                      ? "hidden research-extra"
                      : ""
                  }`}
                >
                  {/* Research Image */}
                  {(item.gif_url || item.image_url) && (
                    <div className="aspect-video overflow-hidden bg-gray-800">
                      <img
                        src={
                          item.gif_url ??
                          item.image_url ??
                          ""
                        }
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5 md:p-6">
                    <h3 className="text-lg font-semibold leading-snug text-white">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="mt-3 text-sm leading-6 text-gray-400">
                        {item.description}
                      </p>
                    )}

                    {item.research_url && (
                      <a
                        href={item.research_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-block text-sm font-medium text-white/80 transition hover:text-white"
                      >
                        Learn more →
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
        </div>

        {/* View More */}
        {research.length > 3 && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => {
                const hiddenItems =
                  document.querySelectorAll(
                    ".research-extra",
                  );

                const button =
                  document.getElementById(
                    "research-view-more",
                  );

                const isExpanded =
                  button?.getAttribute(
                    "data-expanded",
                  ) === "true";

                hiddenItems.forEach((item) => {
                  item.classList.toggle(
                    "hidden",
                    isExpanded,
                  );
                });

                if (button) {
                  button.setAttribute(
                    "data-expanded",
                    String(!isExpanded),
                  );

                  button.textContent = isExpanded
                    ? "View more"
                    : "View less";
                }
              }}
              id="research-view-more"
              data-expanded="false"
              className="rounded-full border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition hover:border-gray-900 hover:bg-gray-900 hover:text-white"
            >
              View more
            </button>
          </div>
        )}
      </>
    )}
  </div>
</section>

{/* Publications */}
<section
  id="publications"
  className="px-6 py-20 md:py-24"
>
  <div className="mx-auto max-w-7xl">
    {/* Header */}
    <div className="mb-10">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-gray-400">
        Publications
      </p>

      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
        Selected Publications
      </h2>
    </div>

    {loadingPublications ? (
      <p className="text-sm text-gray-500">
        Loading publications...
      </p>
    ) : publications.length === 0 ? (
      <p className="text-sm text-gray-500">
        No publications available yet.
      </p>
    ) : (
      <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5 md:p-6 lg:p-8">
        {/* Publications Grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {publications
            .slice(
              0,
              showAllPublications
                ? publications.length
                : 3,
            )
            .map((publication) => (
              <article
                key={publication.id}
                className="group overflow-hidden rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                {/* Image */}
                <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                  {publication.image_url ? (
                    <img
                      src={publication.image_url}
                      alt={publication.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 md:p-6">
                  {/* Year */}
                  {publication.year && (
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400">
                      {publication.year}
                    </p>
                  )}

                  {/* Title */}
                  <h3 className="mt-3 text-lg font-semibold leading-7 text-gray-900">
                    {publication.title}
                  </h3>

                  {/* Authors */}
                  {publication.authors && (
                    <p className="mt-3 text-sm leading-6 text-gray-500">
                      {publication.authors}
                    </p>
                  )}

                  {/* Journal */}
                  {publication.journal && (
                    <p className="mt-3 text-sm italic leading-6 text-gray-400">
                      {publication.journal}
                    </p>
                  )}

                  {/* Description */}
                  {publication.description && (
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-500">
                      {publication.description}
                    </p>
                  )}

                  {/* Links */}
                  <div className="mt-5 flex flex-wrap gap-4 text-sm">
                    {publication.doi && (
                      <a
                        href={`https://doi.org/${publication.doi.replace(
                          "https://doi.org/",
                          "",
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-gray-700 transition hover:text-black"
                      >
                        DOI →
                      </a>
                    )}

                    {publication.url && (
                      <a
                        href={publication.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-gray-700 transition hover:text-black"
                      >
                        View Publication →
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
        </div>

        {/* View More / Less */}
        {publications.length > 3 && (
          <div className="mt-8 flex justify-center border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={() =>
                setShowAllPublications(
                  (current) => !current,
                )
              }
              className="text-sm font-medium text-gray-600 transition hover:text-black"
            >
              {showAllPublications
                ? "View less ↑"
                : "View more ↓"}
            </button>
          </div>
        )}
      </div>
    )}
  </div>
</section>


{/* Patents */}
<section
  id="patents"
  className="px-6 py-20 md:py-24"
>
  <div className="mx-auto max-w-5xl">
    {/* Header */}
    <div className="mb-8">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-gray-400">
        Patents
      </p>

      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
        Patents & Intellectual Property
      </h2>
    </div>

    {loadingPatents ? (
      <p className="text-sm text-gray-500">
        Loading patents...
      </p>
    ) : patents.length === 0 ? (
      <p className="text-sm text-gray-500">
        No patents available yet.
      </p>
    ) : (
      <>
        <div>
          {patents
            .slice(
              0,
              showAllPatents ? patents.length : 3,
            )
            .map((patent) => (
              <article
                key={patent.id}
                className="border-b border-gray-200 py-6 first:border-t first:border-gray-200"
              >
                <div className="flex gap-6">
                  {/* Year */}
                  {patent.year && (
                    <div className="hidden w-16 shrink-0 pt-1 text-sm text-gray-400 sm:block">
                      {patent.year}
                    </div>
                  )}

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold leading-7 text-gray-900 md:text-lg">
                      {patent.title}
                    </h3>

                    {patent.inventors && (
                      <p className="mt-2 text-sm leading-6 text-gray-500">
                        {patent.inventors}
                      </p>
                    )}

                    <div className="mt-2 text-sm text-gray-400">
                      {patent.patent_number && (
                        <span>
                          {patent.patent_number}
                        </span>
                      )}

                      {patent.patent_number &&
                        patent.year && (
                          <span> · </span>
                        )}

                      {patent.year && (
                        <span className="sm:hidden">
                          {patent.year}
                        </span>
                      )}
                    </div>

                    {patent.description && (
                      <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-500">
                        {patent.description}
                      </p>
                    )}

                    {patent.url && (
                      <a
                        href={patent.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block text-sm font-medium text-gray-700 transition hover:text-black"
                      >
                        View Patent →
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
        </div>

        {/* View More */}
        {patents.length > 3 && (
          <div className="mt-8">
            <button
              type="button"
              onClick={() =>
                setShowAllPatents(
                  (current) => !current,
                )
              }
              className="text-sm font-medium text-gray-600 transition hover:text-black"
            >
              {showAllPatents
                ? "View less ↑"
                : "View more ↓"}
            </button>
          </div>
        )}
      </>
    )}
  </div>
</section>

      {/* Team */}
      <section id="team" className="px-6 py-24 md:py-28">
  <div className="mx-auto max-w-6xl">

    {/* Section Header */}
    <div className="mb-14">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-gray-400">
        Team
      </p>

      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
        Our Research Team
      </h2>
    </div>

    {/* Site Owner */}
    {profile && (
      <div className="mb-16 flex justify-center">
        <article className="w-full max-w-sm text-center">

          {/* Owner Photo */}
          <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-full bg-slate-100">
            {profile.profile_image_url ? (
              <img
                src={profile.profile_image_url}
                alt={profile.name}
                className="h-36 w-36 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-36 w-36 items-center justify-center rounded-full bg-slate-200 text-4xl font-semibold text-slate-500">
                {profile.name.charAt(0)}
              </div>
            )}
          </div>

          <h3 className="mt-5 text-xl font-semibold text-gray-900">
            {profile.name}
          </h3>

          {profile.position && (
            <p className="mt-2 text-sm font-medium text-gray-600">
              {profile.position}
            </p>
          )}

          {profile.field && (
            <p className="mt-1 text-sm text-gray-400">
              {profile.field}
            </p>
          )}

          <div className="mt-4 flex justify-center gap-4 text-sm">
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="text-gray-500 transition hover:text-gray-900"
              >
                Email
              </a>
            )}

            {profile.linkedin && (
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 transition hover:text-gray-900"
              >
                LinkedIn
              </a>
            )}
          </div>
        </article>
      </div>
    )}

    {/* Team Members */}
    <div className="grid gap-x-6 gap-y-12 md:grid-cols-2 lg:gap-x-10">
      {teamMembers.map((member) => (
        <article
          key={member.id}
          className="flex flex-col items-center text-center"
        >
          {/* Photo Background */}
          <div className="flex h-36 w-36 items-center justify-center rounded-full bg-slate-100">
            {member.photo_url ? (
              <img
                src={member.photo_url}
                alt={member.name}
                className="h-28 w-28 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-slate-200 text-3xl font-semibold text-slate-500">
                {member.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Name */}
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            {member.name}
          </h3>

          {/* Role */}
          {member.team_roles[0]?.name && (
            <p className="mt-1 text-sm font-medium text-gray-600">
              {member.team_roles[0].name}
            </p>
          )}

          {/* Position */}
          {member.position && (
            <p className="mt-1 text-sm text-gray-400">
              {member.position}
            </p>
          )}

          {/* Bio */}
          {member.bio && (
            <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
              {member.bio}
            </p>
          )}

          {/* Links */}
          <div className="mt-3 flex gap-4 text-sm">
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="text-gray-500 transition hover:text-gray-900"
              >
                Email
              </a>
            )}

            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 transition hover:text-gray-900"
              >
                LinkedIn
              </a>
            )}
          </div>
        </article>
      ))}
    </div>

  </div>
</section>
      {/* News */}
<section
  id="news"
  className="px-6 py-20 md:py-24"
>
  <div className="mx-auto max-w-5xl">
    {/* Header */}
    <div className="mb-8">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-gray-400">
        News
      </p>

      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
        Headline News
      </h2>
    </div>

    {/* Loading */}
    {loadingNews ? (
      <p className="text-sm text-gray-500">
        Loading news...
      </p>
    ) : news.length === 0 ? (
      <p className="text-sm text-gray-500">
        No news available yet.
      </p>
    ) : (
      <>
        {/* News List */}
        <div>
          {news
            .slice(
              0,
              showAllNews ? news.length : 3,
            )
            .map((item) => (
              <article
                key={item.id}
                className="border-b border-gray-200 py-6 first:border-t first:border-gray-200"
              >
                <div className="grid gap-6 md:grid-cols-[120px_1fr] md:items-start">
                  {/* Date */}
                  <div className="text-sm text-gray-400">
                    {item.news_date}
                  </div>

                  {/* Content */}
                  <div className="min-w-0">
                    {/* Media */}
                    {item.video_url ? (
                      <div className="mb-5 w-full max-w-md overflow-hidden rounded-xl bg-gray-100">
                        <iframe
                          src={item.video_url.replace(
                            "watch?v=",
                            "embed/",
                          )}
                          title={item.title}
                          className="aspect-video w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    ) : item.image_url ? (
                      <div className="mb-5 w-full max-w-md overflow-hidden rounded-xl">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="aspect-video w-full object-cover"
                        />
                      </div>
                    ) : null}

                    {/* Meta */}
                    {(item.type || item.source) && (
                      <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-gray-400">
                        {item.type && (
                          <span>{item.type}</span>
                        )}

                        {item.type && item.source && (
                          <span>•</span>
                        )}

                        {item.source && (
                          <span>{item.source}</span>
                        )}
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="mt-2 text-lg font-semibold leading-7 text-gray-900 md:text-xl">
                      {item.title}
                    </h3>

                    {/* Description */}
                    {item.description && (
                      <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-500">
                        {item.description}
                      </p>
                    )}

                    {/* Read More */}
                    {item.external_url && (
                      <a
                        href={item.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block text-sm font-medium text-gray-700 transition hover:text-black"
                      >
                        Read More →
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
        </div>

        {/* View More */}
        {news.length > 3 && (
          <div className="mt-8">
            <button
              type="button"
              onClick={() =>
                setShowAllNews(
                  (current) => !current,
                )
              }
              className="text-sm font-medium text-gray-600 transition hover:text-black"
            >
              {showAllNews
                ? "View less ↑"
                : "View more ↓"}
            </button>
          </div>
        )}
      </>
    )}
  </div>
</section>



      {/* Footer */}
<footer
  id="contact"
  className="border-t border-gray-8600 bg-gray-700 px-6 py-16 text-white"
>
  <div className="mx-auto max-w-6xl">
    <div className="grid gap-12 md:grid-cols-2">

      {/* Identity */}
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-gray-500">
          Contact
        </p>

        <h2 className="mt-4 text-2xl font-semibold tracking-tight">
          {profile?.name ?? "Professor Name"}
        </h2>

        {profile?.position && (
          <p className="mt-2 text-sm text-gray-400">
            {profile.position}
          </p>
        )}
      </div>

      {/* Contact Information */}
      <div className="space-y-4">

        {/* ORCID */}
        {profile?.orchid_id && (
          <div className="flex items-start gap-4">
            <img
              src="/icons/orcidid.svg"
              alt="ORCID"
              className="mt-0.5 h-[18px] w-[18px] shrink-0"
            />

            <span className="text-sm leading-6 text-gray-300">
              {profile.orchid_id}
            </span>
          </div>
        )}

        {/* Address */}
        {profile?.address && (
          <div className="flex items-start gap-4">
            <img
              src="/icons/map-pin.svg"
              alt="Address"
              className="mt-0.5 h-[18px] w-[18px] shrink-0"
            />

            <span className="text-sm leading-6 text-gray-300">
              {profile.address}
            </span>
          </div>
        )}

        {/* Phone */}
        {profile?.phone && (
          <div className="flex items-start gap-4">
            <img
              src="/icons/phone.svg"
              alt="Phone"
              className="mt-0.5 h-[18px] w-[18px] shrink-0"
            />

            <a
              href={`tel:${profile.phone}`}
              className="text-sm leading-6 text-gray-300 transition hover:text-white"
            >
              {profile.phone}
            </a>
          </div>
        )}

        {/* Email */}
        {profile?.email && (
          <div className="flex items-start gap-4">
            <img
              src="/icons/mail.svg"
              alt="Email"
              className="mt-0.5 h-[18px] w-[18px] shrink-0"
            />

            <a
              href={`mailto:${profile.email}`}
              className="text-sm leading-6 text-gray-300 transition hover:text-white"
            >
              {profile.email}
            </a>
          </div>
        )}

        {/* X */}
        {profile?.x_account && (
          <div className="flex items-start gap-4">
            <img
              src="/icons/twitter.svg"
              alt="X"
              className="mt-0.5 h-[18px] w-[18px] shrink-0"
            />

            <a
              href={profile.x_account}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm leading-6 text-gray-300 transition hover:text-white"
            >
              X
            </a>
          </div>
        )}

        {/* LinkedIn */}
        {profile?.linkedin && (
          <div className="flex items-start gap-4">
            <img
              src="/icons/linkedin.svg"
              alt="LinkedIn"
              className="mt-0.5 h-[18px] w-[18px] shrink-0"
            />

            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm leading-6 text-gray-300 transition hover:text-white"
            >
              LinkedIn
            </a>
          </div>
        )}
      </div>
    </div>

    {/* Bottom */}
    <div className="mt-14 border-t border-gray-800 pt-6">
      <div className="flex flex-col gap-3 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()}{" "}
          {profile?.name ?? "Professor Name"}. All rights reserved.
        </p>

        <a
          href="#home"
          className="transition hover:text-gray-300"
        >
          Back to top ↑
        </a>
      </div>
    </div>
  </div>
</footer>



    </main>
  );
}