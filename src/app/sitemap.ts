import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

const ROUTES = [
  "",
  "/about",
  "/contact",
  "/privacy",
  "/hiring",
  "/scout",
  "/rankings",
  "/cards",
  "/squad",
  "/board",
  "/duel",
  "/versus",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    url: `${SITE}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
