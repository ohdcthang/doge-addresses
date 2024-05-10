/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: function (config, options) {
        config.experiments = {
            ...config.experiments,
            topLevelAwait: true,
            asyncWebAssembly: true,
          };
      
        return config;
    }
};

export default nextConfig;
