export default function parseSort(sortBy) {
  if (!sortBy) return '-createdAt';
  const parts = String(sortBy)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const mapped = parts.map((p) => {
    const [field, dir] = p.split(':');
    return dir && dir.toLowerCase() === 'desc' ? `-${field}` : field;
  });
  return mapped.join(' ');
}
