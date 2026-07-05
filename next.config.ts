import path from "path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Pin the workspace root: a stray lockfile in the home directory would
  // otherwise be picked up as the monorepo root.
  turbopack: {
    root: path.join(__dirname),
  },
  // Keep pdfkit/fontkit unbundled so their bundled font-metric (.afm) files
  // resolve from node_modules at runtime instead of a missing bundle path.
  serverExternalPackages: ["pdfkit", "fontkit"],
};

export default withNextIntl(nextConfig);
