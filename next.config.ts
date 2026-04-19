import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "static-cdn.jtvnw.net" },
    ],
  },

  // Client-side routing: /explore, /activity, /profile all serve the SPA shell
  async rewrites() {
    return [
      { source: "/explore", destination: "/" },
      { source: "/activity", destination: "/" },
      { source: "/profile", destination: "/" },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https://img.youtube.com https://i.ytimg.com https://static-cdn.jtvnw.net https://*.ggpht.com",
              "media-src 'self'",
              "frame-src https://www.youtube.com https://player.twitch.tv https://player.kick.com",
              "connect-src 'self' https://www.googleapis.com https://api.twitch.tv https://api.x.com https://*.substack.com https://kick.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
