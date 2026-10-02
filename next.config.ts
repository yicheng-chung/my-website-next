import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
      // Notion's own hosted images (covers/content pulled from a page's
      // blocks that aren't external URLs) — presigned, short-lived S3 links,
      // re-fetched fresh from Notion on every page render (see blog.ts's
      // cache: "no-store"), so staleness isn't a concern here.
      {
        protocol: "https",
        hostname: "prod-files-secure.s3.us-west-2.amazonaws.com",
      },
      // Some book covers are set as an external URL (books.com.tw) rather
      // than a Notion-hosted cover.
      {
        protocol: "https",
        hostname: "www.books.com.tw",
      },
    ],
  },
};

export default nextConfig;
