const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '3k69kprkzj.ufs.sh',
        port: '',
        pathname: '/**', // Use /** instead of **
      },
      {
        protocol: 'https',
        hostname: 'xlhbyy920i.ufs.sh',
        port: '',
        pathname: '/**', // Use /** instead of **
      },
      // add more if needed
    ],
  },
};

export default nextConfig;