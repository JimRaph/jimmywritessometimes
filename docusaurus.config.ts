import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import path from 'path';


const config: Config = {
  title: 'JimmyWritesSometimes',
  tagline: 'Learn all about software engineering and AI.',


  future: {
    v4: true,
  },


  url: 'https://jimmyesang.vercel.app',

  baseUrl: '/articles/',


  organizationName: 'JimRaph', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  

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
  stylesheets: [
  {
    href: 'https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css',
    type: 'text/css',
    integrity: 'sha384-+fM4eK6txL+LCdB1+2R5PRZ4qj8xK5Fq1rJwC5fj/9cKqq3h76d4dz3QIOHy4T2V',
    crossorigin: 'anonymous',
  },
  ],
  
  themeConfig: {
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
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,

};

export default config;
