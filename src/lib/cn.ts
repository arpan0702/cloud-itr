type ClassValue = string | number | null | undefined | false | ClassValue[];

function flatten(input: ClassValue[], out: string[]) {
  for (const value of input) {
    if (!value && value !== 0) continue;
    if (Array.isArray(value)) {
      flatten(value, out);
    } else {
      out.push(String(value));
    }
  }
}

/**
 * Minimal classnames combinator. Kept dependency-free on purpose — swap for
 * `clsx` + `tailwind-merge` later if class conflicts start showing up.
 */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  flatten(inputs, out);
  return out.join(" ");
}
