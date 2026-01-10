import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import path from 'path';


const config: Config = {
  title: 'JimmyWritesSometimes',
  tagline: 'Learn all about software engineering and AI.',
  favicon: '/img/favicon.ico',
  future: { v4: true },

  url: 'https://jimmyesang.vercel.app',
  baseUrl: '/articles/',
  trailingSlash: true,

  organizationName: 'JimRaph',
  projectName: 'jimmywritessometimes',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  headTags: [
    { tagName: 'meta', attributes: { name: 'theme-color', content: '#0f172a' } },
    {
      tagName: 'link',
      attributes: {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/img/apple-touch-icon.png',
      },
    },
    { tagName: 'link', attributes: { rel: 'manifest', href: '/site.webmanifest' } },
  ],

 presets: [
    [
      'classic',
      {
        docs: {
          path: 'docs',
          sidebarPath: './sidebars.ts',
          routeBasePath: '/', 
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],

  themeConfig: {
    image: 'img/social-card.png',
    colorMode: { respectPrefersColorScheme: true },
    navbar: {
      title: 'JimmyWritesSometimes',
      items: [
        { href: 'https://github.com/jimraph', label: 'GitHub', position: 'right' },
      ],
    },
    footer: {
      links: [{ title: 'jimmywritessometimes' }],
      copyright: `© ${new Date().getFullYear()} JimmyWritesSometimes.`,
    },
    metadata: [
      {
        name: 'description',
        content:
          'JimmyWritesSometimes is a technical blog covering software engineering, AI systems, and practical engineering insights.',
      },
      {
        name: 'keywords',
        content:
          'software engineering, artificial intelligence, machine learning, backend engineering, web development, system design, AI tooling',
      },
      { name: 'author', content: 'Jimmy' },
    ],
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },

  staticDirectories: ['static', 'ai_models'],

  plugins: [
    async function myWebpackLoaderPlugin() {
      return {
        name: 'webpack-binary-loader',
        configureWebpack() {
          return {
            module: {
              rules: [
                {
                  test: /\.(onnx|bin|dat|json)$/,
                  resourceQuery: /url/,
                  type: 'asset/resource',
                },
              ],
            },
          };
        },
      };
    },

    async function binaryAssetPlugin() {
      return {
        name: 'binary-asset-plugin',
        configureWebpack(config, isServer) {
          if (isServer) {
            return {
              resolve: {
                alias: {
                  './SearchBar': path.resolve(
                    __dirname,
                    'src/components/EmptyComponent.tsx'
                  ),
                },
              },
            };
          }
          return {};
        },
      };
    },
  ],
};

export default config;
