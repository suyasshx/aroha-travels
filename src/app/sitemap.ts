import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { PackageStatus } from "@prisma/client";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/packages`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Dynamic published package routes
  try {
    const publishedPackages = await prisma.package.findMany({
      where: { status: PackageStatus.PUBLISHED },
      select: { slug: true, updatedAt: true },
    });

    for (const pkg of publishedPackages) {
      routes.push({
        url: `${baseUrl}/packages/${pkg.slug}`,
        lastModified: pkg.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch (err) {
    console.error("Sitemap generation error:", err);
  }

  return routes;
}

