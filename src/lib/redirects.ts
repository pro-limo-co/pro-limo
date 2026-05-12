export function sanitizeInternalPath(value: string | string[] | undefined) {
  const nextValue = Array.isArray(value) ? value[0] : value;
  if (!nextValue || !nextValue.startsWith("/") || nextValue.startsWith("//")) {
    return "/admin/dispatch";
  }
  return nextValue;
}

