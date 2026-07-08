/** Light, dependency-free formatters (safe to import into client components). */

export function fmtNetWorth(b: number): string {
  if (b >= 1000) return `$${(b / 1000).toFixed(1)}T`;
  if (b >= 100) return `$${Math.round(b)}B`;
  if (b >= 1) return `$${b.toFixed(1)}B`;
  return `$${Math.round(b * 1000)}M`;
}

export type TierClass = "elite" | "gold" | "silver" | "bronze";
export function tierFromOverall(o: number): TierClass {
  if (o >= 90) return "elite";
  if (o >= 80) return "gold";
  if (o >= 70) return "silver";
  return "bronze";
}

const NAME_TO_ISO: Record<string, string> = {
  USA: "US", "United States": "US", France: "FR", India: "IN", Spain: "ES",
  Mexico: "MX", China: "CN", Canada: "CA", Germany: "DE", Italy: "IT",
  UK: "GB", "United Kingdom": "GB", Australia: "AU", Indonesia: "ID", Japan: "JP",
  Russia: "RU", Brazil: "BR", Switzerland: "CH", "Hong Kong": "HK", Austria: "AT",
  Netherlands: "NL", Sweden: "SE", Singapore: "SG", Thailand: "TH", Nigeria: "NG",
  "South Africa": "ZA", UAE: "AE", "United Arab Emirates": "AE", Israel: "IL",
  "South Korea": "KR", Taiwan: "TW", Chile: "CL", Colombia: "CO", Philippines: "PH",
  Malaysia: "MY", Belgium: "BE", Norway: "NO", Denmark: "DK", Ireland: "IE",
  "Czech Republic": "CZ", Cyprus: "CY", Monaco: "MC", "Saudi Arabia": "SA",
  Egypt: "EG", Turkey: "TR", Greece: "GR", Portugal: "PT", Finland: "FI",
  "New Zealand": "NZ", Argentina: "AR", Ukraine: "UA", Poland: "PL",
};

export function isoOf(country: string): string {
  return NAME_TO_ISO[country] ?? country.slice(0, 2).toUpperCase();
}

export function flagOf(country: string): string {
  const iso = NAME_TO_ISO[country];
  if (!iso) return "🌐";
  return String.fromCodePoint(
    ...[...iso.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)),
  );
}
