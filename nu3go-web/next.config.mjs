/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: ["lucide-react", "recharts"],
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "cdn.nu3go.lk",
            },
            {
                protocol: "https",
                hostname: "*.digitaloceanspaces.com",
            },
        ],
    },
    // Output standalone for Docker
    output: "standalone",
};

export default nextConfig;
