// DEMO ONLY. A tiny non-cryptographic hash so that plaintext passwords are never
// written to localStorage. A real backend must use bcrypt/argon2 on the server.
export function demoHash(text) {
  const salted = `cleannest::${text}`;
  let h = 2166136261;
  for (let i = 0; i < salted.length; i++) {
    h ^= salted.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}
