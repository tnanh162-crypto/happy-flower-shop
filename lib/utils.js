export function slugify(str) {
  const from = "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ";
  const to = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd";
  let s = str.toLowerCase().trim();
  for (let i = 0; i < from.length; i++) {
    s = s.replaceAll(from[i], to[i]);
  }
  return s
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function uniqueSlug(db, base, ignoreId = null) {
  let slug = slugify(base) || "san-pham";
  let candidate = slug;
  let i = 2;
  while (true) {
    const row = ignoreId
      ? db.prepare("SELECT id FROM products WHERE slug = ? AND id != ?").get(candidate, ignoreId)
      : db.prepare("SELECT id FROM products WHERE slug = ?").get(candidate);
    if (!row) return candidate;
    candidate = `${slug}-${i}`;
    i++;
  }
}
