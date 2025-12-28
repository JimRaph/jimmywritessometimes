import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import path from 'path'


const config: Config = {
  title: 'JimmyWritesSometimes',
  tagline: 'Learn all about software engineering and AI.',

  favicon: '/img/favicon.ico',
  future: {
    v4: true,
  },


  url: 'https://jimmyesang.vercel.app',
  baseUrl: '/articles/',
  trailingSlash: true, 


  organizationName: 'JimRaph', // Usually your GitHub org/user name.
  projectName: 'jimmywritessometimes', // Usually your repo name.

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  
  headTags: [
    {
      tagName: 'meta',
      attributes: {
        name: 'theme-color',
        content: '#0f172a',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/img/apple-touch-icon.png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'manifest',
        href: '/site.webmanifest',
      },
    },
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
      } satisfies Preset.Options,
    ],
  ],
  // stylesheets: [
  // {
  //   href: 'https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css',
  //   type: 'text/css',
  //   integrity: 'sha384-+fM4eK6txL+LCdB1+2R5PRZ4qj8xK5Fq1rJwC5fj/9cKqq3h76d4dz3QIOHy4T2V',
  //   crossorigin: 'anonymous',
  // },
  // ],
  
  themeConfig: {
    image: 'img/social-card.png',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    
    navbar: {
      title: 'JimmyWritesSometimes',

      items: [

        {
          href: 'https://github.com/jimraph',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: undefined,
      links: [
      
        {
          title: 'jimmywritessometimes',
        },
      ],
      copyright: `  © ${new Date().getFullYear()} JimmyWritesSometimes.`,
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
      {
        name: 'author',
        content: 'Jimmy',
      },
    ],
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
  staticDirectories: ['static', 'ai_models'],
  plugins: [
    // This is your local "Binary Fix" plugin
    async function myWebpackLoaderPlugin(context, options) {
      return {
        name: 'webpack-binary-loader',
        configureWebpack(config, isServer) {
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
                  // Tell the server to load a 'dummy' component instead of the real AI one
                  './SearchBar': path.resolve(__dirname, 'src/components/EmptyComponent.tsx'),
                },
              },
            };
          }
          return {}; // Browser build gets the real thing
        },
      };
    }
  ],
  
};

export default config;
