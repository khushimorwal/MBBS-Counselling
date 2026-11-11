"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { isPercentage } from "@/lib/validators";
import { buildProfilePayload, emptyForm, profileToForm } from "@/lib/profile";
import FormField from "@/components/FormField";
import Button from "@/components/Button";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png"];

function Section({ title, children }) {
  return (
    <section className="mb-6 rounded-2xl border border-line bg-white p-6">
      <h2 className="mb-4 font-display text-lg font-bold">{title}</h2>
      <div className="grid gap-x-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export default function ProfilePage() {
  const [form, setForm] = useState(emptyForm());
  const [imageUrl, setImageUrl] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api
      .get("/student-profile")
      .then(({ data }) => {
        setForm(profileToForm(data.profile));
        setImageUrl(data.profile?.profileImage?.url || "");
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const setTop = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const setNested = (section) => (e) =>
    setForm({ ...form, [section]: { ...form[section], [e.target.name]: e.target.value } });

  const validate = () => {
    const next = {};
    ["tenth", "twelfth", "graduation"].forEach((s) => {
      if (!isPercentage(form[s].percentage)) next[`${s}.percentage`] = "Enter 0 to 100";
    });
    const { min, max } = form.budget;
    if (min !== "" && max !== "" && Number(min) > Number(max)) {
      next["budget.max"] = "Max must be at least min";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const { data } = await api.put("/student-profile", buildProfilePayload(form));
      setForm(profileToForm(data.profile));
      toast.success("Profile saved");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const onImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) return toast.error("Only JPG or PNG images are allowed");
    if (file.size > MAX_IMAGE_BYTES) return toast.error("Image must be 5 MB or smaller");

    const body = new FormData();
    body.append("profileImage", file);
    setUploading(true);
    try {
      const { data } = await api.put("/student-profile/profile-image", body);
      setImageUrl(data.profileImage.url);
      toast.success("Profile image updated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <p className="text-muted">Loading profile...</p>;

  return (
    <form onSubmit={onSave} noValidate>
      <h1 className="mb-6 font-display text-3xl font-bold">My Profile</h1>

      <section className="mb-6 flex items-center gap-4 rounded-2xl border border-line bg-white p-6">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="Profile" className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-soft text-xs text-brand">
            No image
          </div>
        )}
        <label className="cursor-pointer rounded-xl border border-line px-3 py-2 text-sm font-medium hover:bg-surface">
          {uploading ? "Uploading..." : "Change image"}
          <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={onImage} disabled={uploading} />
        </label>
      </section>

      <Section title="Personal details">
        <FormField label="Date of birth" name="dob" type="date" value={form.dob} onChange={setTop} />
        <FormField label="Gender" name="gender" as="select" value={form.gender} onChange={setTop}>
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </FormField>
        <FormField label="City" name="city" value={form.city} onChange={setTop} />
        <FormField label="State" name="state" value={form.state} onChange={setTop} />
        <FormField label="Country" name="country" value={form.country} onChange={setTop} />
      </Section>

      <Section title="10th">
        <FormField label="Board" name="board" id="tenth-board" value={form.tenth.board} onChange={setNested("tenth")} />
        <FormField label="Percentage" name="percentage" id="tenth-percentage" type="number" step="0.01" value={form.tenth.percentage} onChange={setNested("tenth")} error={errors["tenth.percentage"]} />
        <FormField label="Passing year" name="passingYear" id="tenth-passingYear" type="number" value={form.tenth.passingYear} onChange={setNested("tenth")} />
      </Section>

      <Section title="12th">
        <FormField label="Board" name="board" id="twelfth-board" value={form.twelfth.board} onChange={setNested("twelfth")} />
        <FormField label="Stream" name="stream" id="twelfth-stream" value={form.twelfth.stream} onChange={setNested("twelfth")} />
        <FormField label="Percentage" name="percentage" id="twelfth-percentage" type="number" step="0.01" value={form.twelfth.percentage} onChange={setNested("twelfth")} error={errors["twelfth.percentage"]} />
        <FormField label="Passing year" name="passingYear" id="twelfth-passingYear" type="number" value={form.twelfth.passingYear} onChange={setNested("twelfth")} />
      </Section>

      <Section title="Graduation (optional)">
        <FormField label="College" name="college" id="graduation-college" value={form.graduation.college} onChange={setNested("graduation")} />
        <FormField label="Course" name="course" id="graduation-course" value={form.graduation.course} onChange={setNested("graduation")} />
        <FormField label="Percentage" name="percentage" id="graduation-percentage" type="number" step="0.01" value={form.graduation.percentage} onChange={setNested("graduation")} error={errors["graduation.percentage"]} />
        <FormField label="Passing year" name="passingYear" id="graduation-passingYear" type="number" value={form.graduation.passingYear} onChange={setNested("graduation")} />
      </Section>

      <Section title="Budget (INR per year)">
        <FormField label="Minimum" name="min" id="budget-min" type="number" min="0" value={form.budget.min} onChange={setNested("budget")} />
        <FormField label="Maximum" name="max" id="budget-max" type="number" min="0" value={form.budget.max} onChange={setNested("budget")} error={errors["budget.max"]} />
      </Section>

      <Button type="submit" loading={saving} className="sm:w-48">Save profile</Button>
    </form>
  );
}
