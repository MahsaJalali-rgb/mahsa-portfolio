import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type {
  ChangeEvent,
  FormEvent,
} from "react";
import { supabase } from "../services/supabase";

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
};

const emptyMemberForm = {
  name: "",
  position: "",
  role_id: "",
  email: "",
  linkedin: "",
  bio: "",
  display_order: "0",
  joined_at: "",
  active: true,
};

const emptyRoleForm = {
  name: "",
  display_order: "0",
};

export default function AdminTeam() {
  const navigate = useNavigate();

  const [roles, setRoles] = useState<TeamRole[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);

  const [memberForm, setMemberForm] =
    useState(emptyMemberForm);

  const [roleForm, setRoleForm] =
    useState(emptyRoleForm);

  const [editingMemberId, setEditingMemberId] =
    useState<string | null>(null);

  const [editingRoleId, setEditingRoleId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [savingMember, setSavingMember] =
    useState(false);

  const [savingRole, setSavingRole] =
    useState(false);
  const [memberPhotoFile, setMemberPhotoFile] =
useState<File | null>(null);

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

      await Promise.all([
        loadRoles(),
        loadMembers(),
      ]);
    }

    checkUser();
  }, [navigate]);

  async function loadRoles() {
    const { data, error } = await supabase
      .from("team_roles")
      .select("*")
      .order("display_order", {
        ascending: true,
      });

    if (error) {
      setError(error.message);
      return;
    }

    setRoles(data ?? []);
  }

  async function loadMembers() {
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("display_order", {
        ascending: true,
      });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMembers(data ?? []);
    setLoading(false);
  }

  

  function handleMemberChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;

    setMemberForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleRoleChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const { name, value } = event.target;

    setRoleForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function uploadMemberPhoto(file: File) {
  const extension = file.name.split(".").pop();

  const fileName = `member-${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from("team-member-images")
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
    .from("team-member-images")
    .getPublicUrl(fileName);

  return publicUrl;
}

  async function handleMemberSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSavingMember(true);
    setError("");

    if (!memberForm.name.trim()) {
      setError("Member name is required.");
      setSavingMember(false);
      return;
    }

    if (!memberForm.role_id) {
      setError("Please select a role.");
      setSavingMember(false);
      return;
    }

    let photoUrl =
  editingMemberId
    ? members.find(
        (member) => member.id === editingMemberId,
      )?.photo_url ?? null
    : null;

if (memberPhotoFile) {
  const uploadedUrl = await uploadMemberPhoto(memberPhotoFile);

  if (!uploadedUrl) {
    setSavingMember(false);
    return;
  }

  photoUrl = uploadedUrl;
}

const payload = {
  name: memberForm.name.trim(),
  position: memberForm.position.trim() || null,
  role_id: memberForm.role_id || null,
  photo_url: photoUrl,
  email: memberForm.email.trim() || null,
  linkedin: memberForm.linkedin.trim() || null,
  bio: memberForm.bio.trim() || null,
  display_order: Number(memberForm.display_order) || 0,
  active: memberForm.active,
  joined_at: memberForm.joined_at || null,
};

    if (editingMemberId) {
      const { error } = await supabase
        .from("team_members")
        .update(payload)
        .eq("id", editingMemberId);

      if (error) {
        setError(error.message);
        setSavingMember(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("team_members")
        .insert(payload);

      if (error) {
        setError(error.message);
        setSavingMember(false);
        return;
      }
    }
    setMemberPhotoFile(null);
    setMemberForm(emptyMemberForm);
    setEditingMemberId(null);
    setSavingMember(false);

    await loadMembers();
  }

  async function handleRoleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSavingRole(true);
    setError("");

    if (!roleForm.name.trim()) {
      setError("Role name is required.");
      setSavingRole(false);
      return;
    }

    const payload = {
      name: roleForm.name.trim(),
      display_order:
        Number(roleForm.display_order) || 0,
    };

    if (editingRoleId) {
      const { error } = await supabase
        .from("team_roles")
        .update(payload)
        .eq("id", editingRoleId);

      if (error) {
        setError(error.message);
        setSavingRole(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("team_roles")
        .insert(payload);

      if (error) {
        setError(error.message);
        setSavingRole(false);
        return;
      }
    }

    setRoleForm(emptyRoleForm);
    setEditingRoleId(null);
    setSavingRole(false);

    await loadRoles();
  }

  function handleEditMember(
    member: TeamMember,
  ) {
    setEditingMemberId(member.id);

    setMemberForm({
      name: member.name,
      position: member.position ?? "",
      role_id: member.role_id ?? "",
      email: member.email ?? "",
      linkedin: member.linkedin ?? "",
      bio: member.bio ?? "",
      display_order:
        member.display_order.toString(),
      joined_at: member.joined_at ?? "",
      active: member.active,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleEditRole(role: TeamRole) {
    setEditingRoleId(role.id);

    setRoleForm({
      name: role.name,
      display_order:
        role.display_order.toString(),
    });
  }

  async function handleDeleteMember(
    id: string,
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this team member?",
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    await loadMembers();
  }

  async function handleDeleteRole(
    role: TeamRole,
  ) {
    const membersUsingRole = members.some(
      (member) => member.role_id === role.id,
    );

    if (membersUsingRole) {
      setError(
        "This role is currently assigned to a team member. Change the member's role before deleting it.",
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${role.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("team_roles")
      .delete()
      .eq("id", role.id);

    if (error) {
      setError(error.message);
      return;
    }

    await loadRoles();
  }

  function handleCancelMemberEdit() {
    setEditingMemberId(null);
    setMemberForm(emptyMemberForm);
  }

  function handleCancelRoleEdit() {
    setEditingRoleId(null);
    setRoleForm(emptyRoleForm);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/admin/login");
  }

  function getRoleName(roleId: string | null) {
    if (!roleId) {
      return "No role";
    }

    return (
      roles.find((role) => role.id === roleId)
        ?.name ?? "Unknown role"
    );
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
      <div className="mx-auto max-w-7xl">
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
              Team
            </h1>

            <p className="mt-2 text-gray-500">
              Manage team roles and members.
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

        {/* Roles */}

        <section className="mb-10 rounded-2xl bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Team Roles
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Role order controls the hierarchy on the
              public website.
            </p>
          </div>

          

          <form
            onSubmit={handleRoleSubmit}
            className="mb-8 grid gap-4 md:grid-cols-[1fr_180px_auto]"
          >
            <input
              name="name"
              value={roleForm.name}
              onChange={handleRoleChange}
              placeholder="Role name"
              required
              className="rounded-lg border border-gray-300 px-4 py-3"
            />

            <input
              name="display_order"
              type="number"
              value={roleForm.display_order}
              onChange={handleRoleChange}
              placeholder="Order"
              className="rounded-lg border border-gray-300 px-4 py-3"
            />

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={savingRole}
                className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                {savingRole
                  ? "Saving..."
                  : editingRoleId
                    ? "Update"
                    : "Add Role"}
              </button>

              {editingRoleId && (
                <button
                  type="button"
                  onClick={handleCancelRoleEdit}
                  className="rounded-lg border border-gray-300 px-5 py-3 text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="space-y-3">
            {roles.map((role) => (
              <div
                key={role.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 p-4"
              >
                <div>
                  <p className="font-medium">
                    {role.name}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Hierarchy order:{" "}
                    {role.display_order}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleEditRole(role)
                    }
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleDeleteRole(role)
                    }
                    className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Members */}

        <section className="mb-10 rounded-2xl bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              {editingMemberId
                ? "Edit Team Member"
                : "Add Team Member"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Add members and assign their role in the
              team hierarchy.
            </p>
          </div>

          <form
            onSubmit={handleMemberSubmit}
            className="space-y-5"
          >
            {/* Name */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Name
              </label>

              <input
                name="name"
                value={memberForm.name}
                onChange={handleMemberChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
                placeholder="John Smith"
              />
            </div>

            {/* Position + Role */}

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Position
                </label>

                <input
                  name="position"
                  value={memberForm.position}
                  onChange={handleMemberChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  placeholder=""
                />
              </div>

              <div>
  <label className="mb-2 block text-sm font-medium">
    Profile Photo
  </label>

  <input
    type="file"
    accept="image/png,image/jpeg,image/webp"
    onChange={(event) => {
      setMemberPhotoFile(
        event.target.files?.[0] ?? null,
      );
    }}
    className="w-full rounded-lg border border-gray-300 px-4 py-3"
  />
</div>
{editingMemberId &&
  members.find(
    (member) => member.id === editingMemberId,
  )?.photo_url && (
    <img
      src={
        members.find(
          (member) =>
            member.id === editingMemberId,
        )?.photo_url ?? ""
      }
      alt="Current member"
      className="mt-3 h-24 w-24 rounded-full object-cover"
    />
  )}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Role
                </label>

                <select
                  name="role_id"
                  value={memberForm.role_id}
                  onChange={handleMemberChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
                >
                  <option value="">
                    Select role
                  </option>

                  {roles.map((role) => (
                    <option
                      key={role.id}
                      value={role.id}
                    >
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email + LinkedIn */}

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Email
                </label>

                <input
                  name="email"
                  type="email"
                  value={memberForm.email}
                  onChange={handleMemberChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  placeholder="member@example.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  LinkedIn
                </label>

                <input
                  name="linkedin"
                  type="url"
                  value={memberForm.linkedin}
                  onChange={handleMemberChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </div>

            {/* Bio */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Bio
              </label>

              <textarea
                name="bio"
                value={memberForm.bio}
                onChange={handleMemberChange}
                rows={5}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
                placeholder="Short biography..."
              />
            </div>

            {/* Joined + Order */}

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Joined Date
                </label>

                <input
                  name="joined_at"
                  type="date"
                  value={memberForm.joined_at}
                  onChange={handleMemberChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Display Order
                </label>

                <input
                  name="display_order"
                  type="number"
                  value={memberForm.display_order}
                  onChange={handleMemberChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                />
              </div>
            </div>

            {/* Active */}

            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={memberForm.active}
                onChange={(event) =>
                  setMemberForm((current) => ({
                    ...current,
                    active: event.target.checked,
                  }))
                }
              />

              Active member
            </label>

            {/* Buttons */}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={savingMember}
                className="rounded-lg bg-black px-6 py-3 font-medium text-white disabled:opacity-50"
              >
                {savingMember
                  ? "Saving..."
                  : editingMemberId
                    ? "Update Member"
                    : "Add Member"}
              </button>

              {editingMemberId && (
                <button
                  type="button"
                  onClick={
                    handleCancelMemberEdit
                  }
                  className="rounded-lg border border-gray-300 px-6 py-3 font-medium"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Member List */}

        <section>
          <div className="mb-5">
            <h2 className="text-xl font-semibold">
              Team Members
            </h2>
          </div>

          <div className="space-y-4">
            {members.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center text-gray-500">
                No team members yet.
              </div>
            ) : (
              members.map((member) => (
                <article
                  key={member.id}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold">
                          {member.name}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            member.active
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {member.active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-medium text-gray-700">
                        {getRoleName(member.role_id)}
                      </p>

                      {member.position && (
                        <p className="mt-1 text-sm text-gray-500">
                          {member.position}
                        </p>
                      )}

                      {member.email && (
                        <p className="mt-3 text-sm text-gray-600">
                          {member.email}
                        </p>
                      )}

                      {member.bio && (
                        <p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-6 text-gray-600">
                          {member.bio}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() =>
                          handleEditMember(
                            member,
                          )
                        }
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteMember(
                            member.id,
                          )
                        }
                        className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}