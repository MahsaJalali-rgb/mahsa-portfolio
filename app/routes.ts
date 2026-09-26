import {
  type RouteConfig,
  index,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  route("admin/login", "routes/admin.login.tsx"),
  route("admin", "routes/admin.tsx"),
  route("admin/research", "routes/admin.research.tsx"),
  route("admin/profile", "routes/admin.profile.tsx"),
  route("admin/publications", "routes/admin.publications.tsx"),
  route("admin/patents", "routes/admin.patents.tsx"),
  route("admin/team", "routes/admin.team.tsx"),
  route("admin/news", "routes/admin.news.tsx"),
] satisfies RouteConfig;