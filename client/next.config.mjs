/** @type {import('next').NextConfig} */
const nextConfig = {
	async redirects() {
		return [
		  {
			source: "/",
			destination: "/dashboard",
			permanent: true,
		  },
		];
	  },
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname:
					's3-inventory-management-img-bucket.s3.ap-southeast-2.amazonaws.com',
				port: '',
				pathname: '/**',
			},
		],
	},
};

export default nextConfig;
