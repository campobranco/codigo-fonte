const pkg = require('./package.json');

/** @type {import('next').NextConfig} */
const isGithubActions = process.env.GITHUB_ACTIONS === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: isGithubActions ? 'export' : undefined,
    trailingSlash: false, // Desativado para evitar problemas com APIs no Firebase
    // Se o seu domínio for campobranco.github.io/campobranco, descomente a linha abaixo:
    // basePath: isGithubActions ? '/campobranco' : '',
    typescript: {
        // Desativado para garantir que erros não passem despercebidos, conforme recomendado no relatório de performance
        ignoreBuildErrors: false,
    },
    images: {
        // Habilitado para permitir o redimensionamento e otimização automática do Next.js
        unoptimized: false,
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 86400, // 24 horas de cache para imagens otimizadas
    },
    compiler: {
        // Remove console logs em produção para economizar memória e melhorar a performance
        removeConsole: process.env.NODE_ENV === 'production',
    },
    env: {
        NEXT_PUBLIC_APP_VERSION: pkg.version,
        // Define a URL base para as APIs. No GitHub, aponta para o Firebase.
        NEXT_PUBLIC_API_BASE_URL: isGithubActions ? 'https://campo-branco.web.app' : '',
    },
    swcMinify: true, // Garante a minificação eficiente usando SWC
    turbopack: {},
};

const withPWA = require("@ducanh2912/next-pwa").default({
    dest: "public",
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    swcMinify: true,
    disable: process.env.NODE_ENV === "development",
    skipWaiting: true,
    register: true,
    scope: "/",
    workboxOptions: {
        disableDevLogs: true,
        // Evita cache de URLs externas em desenvolvimento
        cleanupOutdatedCaches: true,
        precacheEntries: [
            // Remove URLs do Firebase Hosting em desenvolvimento
        ],
    },
});

module.exports = withPWA(nextConfig);
