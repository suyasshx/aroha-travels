/**
 * Legacy URL Redirect Infrastructure
 * Handles 140+ legacy URL mappings from previous website versions.
 * Add verified mappings below as old tour paths are reconciled.
 */

export const LEGACY_REDIRECT_MAP: Record<string, string> = {
  // Sample verified mappings from old CMS structure
  "/old-tours/kerala-munnar-alleppey-6d": "/packages/munnar-thekkady-alleppey-houseboat",
  "/old-tours/pkg-kl-07": "/packages/munnar-thekkady-alleppey-houseboat",
  "/tours/munnar-houseboat-special": "/packages/munnar-thekkady-alleppey-houseboat",
  "/old-tours/madurai-rameswaram-5d": "/packages/madurai-rameswaram-kanyakumari",
  "/tours/south-india-temple-circuit": "/packages/madurai-rameswaram-kanyakumari",
  "/old-tours/wayanad-rainforest-4d": "/packages/wayanad-rainforests-heritage-hideaway",
  "/tours/wayanad-eco-retreat": "/packages/wayanad-rainforests-heritage-hideaway",
  "/old-tours/grand-kerala-luxury-8d": "/packages/grand-kerala-odyssey-kochi-munnar-alleppey-marari",
  "/tours/luxury-kerala-odyssey": "/packages/grand-kerala-odyssey-kochi-munnar-alleppey-marari",
};

/**
 * Looks up a path in the legacy redirect registry.
 * Returns destination path or null.
 */
export function getLegacyRedirect(path: string): string | null {
  const normalized = path.toLowerCase().replace(/\/$/, "");
  if (LEGACY_REDIRECT_MAP[normalized]) {
    return LEGACY_REDIRECT_MAP[normalized];
  }
  // If request begins with /old-tours/ or /tours/ without explicit match, redirect to main packages archive
  if (normalized.startsWith("/old-tours") || normalized.startsWith("/tours")) {
    return "/packages";
  }
  return null;
}

