/**
 * Slug generation utility with collision handling
 */

export function generateSlug(title: string, existingSlugs: string[] = []): string {
  // Convert title to URL-safe slug
  let baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  
  // Ensure slug is not empty
  if (!baseSlug) {
    baseSlug = 'deal';
  }
  
  // Check for collisions and add suffix if needed
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    // Generate short random suffix for collision resolution
    const suffix = Math.random().toString(36).substring(2, 8);
    slug = `${baseSlug}-${suffix}`;
    counter++;
    
    // Safety valve to prevent infinite loops
    if (counter > 100) {
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }
  
  return slug;
}

export function isValidSlug(slug: string): boolean {
  // Check if slug is URL-safe and follows our conventions
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length > 0 && slug.length <= 100;
}

export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100); // Limit length
}