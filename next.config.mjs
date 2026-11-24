/** @type {import('next').NextConfig} */
const nextConfig = {
  // Do not tell attackers which framework we use.
  poweredByHeader: false,

  // Security headers added to every response.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Stop browsers from guessing file types.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Do not allow other sites to put LabFix in an <iframe> (clickjacking).
          { key: "X-Frame-Options", value: "DENY" },
          // Only send our origin (not full URLs) to other sites.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Allow the camera (for taking photos of broken PCs), block the rest.
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
