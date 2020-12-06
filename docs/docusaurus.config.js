module.exports = {
  url: 'https://jankuss.github.io', // Your website URL
  baseUrl: '/shroom/',
  projectName: 'shroom',
  organizationName: 'jankuss',
  title: 'Shroom',
  tagline: 'Room Rendering Engine for Retros',
  onBrokenLinks: 'throw',
  favicon: 'img/favicon.ico',
  themeConfig: {
    navbar: {
      title: 'Shroom',
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        {
          href: 'https://github.com/jankuss/shroom',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/jankuss/shroom/edit/master/docs/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
