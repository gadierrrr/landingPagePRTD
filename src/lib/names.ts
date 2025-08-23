export function splitName(s?: string) {
  if (!s) return { FNAME: undefined, LNAME: undefined };
  const name = s.trim().replace(/\s+/g, ' ');
  const parts = name.split(' ');
  if (parts.length === 1) return { FNAME: name, LNAME: '' };
  return { FNAME: parts.slice(0, -1).join(' '), LNAME: parts.slice(-1)[0] };
}