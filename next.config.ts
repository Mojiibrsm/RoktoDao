
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
    NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyCEUQbfu7bP20JS9SHGIo88QjoYTASSQlE",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "mailjet-express.firebaseapp.com",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "mailjet-express",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "mailjet-express.firebasestorage.app",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "1041255436136",
    NEXT_PUBLIC_FIREBASE_APP_ID: "1:1041255436136:web:9a2e9eb00211619d64d0dd",
    NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY: "public_mZ0R0Fsxxuu72DflLr4kGejkwrE=",
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: "https://ik.imagekit.io/uekohag7w",
    NEXT_PUBLIC_SITE_URL: "https://roktodao.bartanow.com"
  }
};

export default nextConfig;


