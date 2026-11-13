/** @type {import('next').NextConfig} */
const nextConfig = {
  // Rotas duplicadas ou herdadas do template apontam para a página canônica.
  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: true },
      { source: '/blog/grid', destination: '/blog-standard', permanent: true },
      { source: '/service/direito-trabalho', destination: '/service/direito-trabalhista', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
