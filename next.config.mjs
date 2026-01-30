// @ts-check

import createNextIntlPlugin from 'next-intl/plugin';
import {inspect} from 'node:util';

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

const finalConfig = withNextIntl(nextConfig);

console.log('[next-config] finalConfig:', inspect(finalConfig, {colors: false, depth: null}));

export default finalConfig;
