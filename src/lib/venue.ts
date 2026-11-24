/**
 * The bookable spaces and the packages built from them.
 * Source: docs/HANDOFF.md section 3.
 */

export const SPACES = ["pavilion", "church"] as const;
export type Space = (typeof SPACES)[number];

export const PACKAGES = ["combination", "pavilion", "church"] as const;
export type PackageId = (typeof PACKAGES)[number];

export interface PackageInfo {
  id: PackageId;
  name: string;
  short: string;
  description: string;
  /** Spaces that must all be free on the day for this package to be available. */
  spaces: readonly Space[];
}

export const PACKAGE_INFO: Record<PackageId, PackageInfo> = {
  combination: {
    id: "combination",
    name: "St. Paul's Church + Pavilion",
    short: "Church + Pavilion",
    description: "Ceremony in the 1879 church (4-hour block), reception in the Pavilion all day. Our most popular package.",
    spaces: ["church", "pavilion"],
  },
  pavilion: {
    id: "pavilion",
    name: "Hood Canal Vista Pavilion",
    short: "Pavilion",
    description: "Ceremony and reception at the Pavilion, 9 am to 10 pm, with the bluff and Hood Canal behind you.",
    spaces: ["pavilion"],
  },
  church: {
    id: "church",
    name: "St. Paul's Church",
    short: "Church only",
    description: "Ceremony in historic St. Paul's, hourly with a 3-hour minimum.",
    spaces: ["church"],
  },
};

export function isPackageId(value: unknown): value is PackageId {
  return typeof value === "string" && (PACKAGES as readonly string[]).includes(value);
}
