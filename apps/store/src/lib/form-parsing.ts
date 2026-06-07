export function getString(formData: FormData, key: string, options?: { trim?: boolean; lowercase?: boolean }): string {
  const value = (formData.get(key) as string) || "";
  const trimmed = options?.trim !== false ? value.trim() : value;
  return options?.lowercase ? trimmed.toLowerCase() : trimmed;
}

export function getNumber(formData: FormData, key: string, defaultValue?: number): number {
  const value = parseInt(getString(formData, key), 10);
  return isNaN(value) ? (defaultValue ?? 0) : value;
}

export function getFloat(formData: FormData, key: string, defaultValue?: number): number {
  const value = parseFloat(getString(formData, key));
  return isNaN(value) ? (defaultValue ?? 0) : value;
}

export function getBoolean(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}

export function getStringArray(formData: FormData, key: string, separator: string = "\n"): string[] {
  return getString(formData, key)
    .split(separator)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function getDate(formData: FormData, key: string): Date | undefined {
  const value = getString(formData, key);
  return value ? new Date(value) : undefined;
}
