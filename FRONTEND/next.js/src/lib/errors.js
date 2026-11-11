export function getErrorMessage(err) {
  const status = err?.response?.status;
  if (status === 429) return "Too many attempts. Please try again later.";
  const message = err?.response?.data?.message;
  if (message) return message;
  if (!err?.response) return "Cannot reach server";
  return "Something went wrong";
}
