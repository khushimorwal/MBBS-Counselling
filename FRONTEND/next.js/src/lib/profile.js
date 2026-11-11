const isEmpty = (v) => v === "" || v === null || v === undefined;
const str = (v) => (isEmpty(v) ? undefined : v);
const num = (v) => (isEmpty(v) ? undefined : Number(v));
const toStr = (v) => (isEmpty(v) ? "" : String(v));

// Remove undefined keys and objects that end up empty.
const prune = (obj) => {
  const out = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v && typeof v === "object") {
      const child = prune(v);
      if (Object.keys(child).length) out[k] = child;
    } else if (v !== undefined) {
      out[k] = v;
    }
  });
  return out;
};

export const emptyForm = () => ({
  dob: "",
  gender: "",
  city: "",
  state: "",
  country: "",
  tenth: { board: "", percentage: "", passingYear: "" },
  twelfth: { board: "", stream: "", percentage: "", passingYear: "" },
  graduation: { college: "", course: "", percentage: "", passingYear: "" },
  budget: { min: "", max: "" },
});

export function profileToForm(profile) {
  const form = emptyForm();
  if (!profile) return form;
  form.dob = profile.dob ? String(profile.dob).slice(0, 10) : "";
  ["gender", "city", "state", "country"].forEach((k) => {
    form[k] = toStr(profile[k]);
  });
  const acad = profile.academicDetails || {};
  ["tenth", "twelfth", "graduation"].forEach((section) => {
    Object.keys(form[section]).forEach((k) => {
      form[section][k] = toStr(acad[section]?.[k]);
    });
  });
  form.budget.min = toStr(profile.budget?.min);
  form.budget.max = toStr(profile.budget?.max);
  return form;
}

export function buildProfilePayload(form) {
  return prune({
    dob: str(form.dob),
    gender: str(form.gender),
    city: str(form.city),
    state: str(form.state),
    country: str(form.country),
    academicDetails: {
      tenth: {
        board: str(form.tenth.board),
        percentage: num(form.tenth.percentage),
        passingYear: num(form.tenth.passingYear),
      },
      twelfth: {
        board: str(form.twelfth.board),
        stream: str(form.twelfth.stream),
        percentage: num(form.twelfth.percentage),
        passingYear: num(form.twelfth.passingYear),
      },
      graduation: {
        college: str(form.graduation.college),
        course: str(form.graduation.course),
        percentage: num(form.graduation.percentage),
        passingYear: num(form.graduation.passingYear),
      },
    },
    budget: {
      min: num(form.budget.min),
      max: num(form.budget.max),
    },
  });
}

export function profileCompleteness(profile) {
  if (!profile) return 0;
  const checks = [
    profile.dob,
    profile.gender,
    profile.city,
    profile.state,
    profile.country,
    profile.academicDetails?.tenth?.percentage,
    profile.academicDetails?.twelfth?.percentage,
    profile.budget?.max,
  ];
  const filled = checks.filter((v) => !isEmpty(v)).length;
  return Math.round((filled / checks.length) * 100);
}
