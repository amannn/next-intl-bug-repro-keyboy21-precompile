// @ts-check

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin({
	experimental: {
		createMessagesDeclaration: "./messages/en.json",
		messages: {
			path: './messages',
			format: 'json',
			locales: 'infer',
			precompile: true,
		}
	},
});

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default (withNextIntl(nextConfig));
