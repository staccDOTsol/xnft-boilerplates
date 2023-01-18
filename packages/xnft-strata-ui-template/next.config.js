const path = require("path");
const withBundleAnalyzer = require("@next/bundle-analyzer");
const withPlugins = require("next-compose-plugins");

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: false,
  webpack5: true,
    images:{
      loader: 'akamai',
      path: '',
  
    },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      os: false,
      child_process: false,
      module: false,
      dns: false,
      net: false, 
      tls: false
    };
    config.module.rules = [
      ...config.module.rules,
      // ensure our libs barrel files don't constitute imports
      {
        test: /packages\/.*src\/index.ts/i,
        sideEffects: false,
      }, {
        test:  /\.(gif|jpe?g|png|svg|node|d.ts|woff2?|eot|ttf|otf)$/,

        use: ["url-loader"],
      },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },{ 
          test: /\.ts$/, 
          use: 'ts-loader', exclude: /node_modules/ 
        },
    ];
    config.resolve.alias = {
      ...config.resolve.alias,
      "@solana/wallet-adapter-react": path.resolve(
        "../../node_modules/@solana/wallet-adapter-react"
      ),
      "bn.js": path.resolve("../../node_modules/bn.js"),
      "@solana/web3.js": path.resolve("../../node_modules/@solana/web3.js"),
      borsh: path.resolve("../../node_modules/borsh"),
      buffer: path.resolve("../../node_modules/buffer"),
    };
    return config;
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/launchpad",
        permanent: false,
      },
      {
        source: "/lbcs/new",
        destination: "/launchpad/lbcs/new",
        permanent: false,
      },
    ];
  },
};

module.exports = withPlugins(
  [withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" })],
  config
);
