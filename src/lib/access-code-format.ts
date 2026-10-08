/** Display format of an access code (safe for the browser: no Node APIs). */
export function formatAccessCode(code: string): string {
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}
