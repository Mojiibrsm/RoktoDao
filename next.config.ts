
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tools.bartanow.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/**",
      },
       {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: "YOUR_API_KEY",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "mailjet-express.firebaseapp.com",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "mailjet-express",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "mailjet-express.appspot.com",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "420317579893",
    NEXT_PUBLIC_FIREBASE_APP_ID: "1:420317579893:web:e0f49a5e427e02597f8287",
    NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY: "public_mZ0R0Fsxxuu72DflLr4kGejkwrE=",
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: "https://ik.imagekit.io/uekohag7w",
    NEXT_PUBLIC_SITE_URL: "https://roktodao.bartanow.com"
  }
};

export default nextConfig;

