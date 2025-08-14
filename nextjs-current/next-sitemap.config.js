/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://santoscsolutions.com',
  generateRobotsTxt: true,
  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: 'monthly',
      priority: path === '/' ? 1.0 : 0.7,
      lastmod: new Date().toISOString(),
      alternateRefs: [],
    }
  },
  additionalPaths: async (config) => {
    return [
      await config.transform(config, '/services'),
      await config.transform(config, '/move-in-out'),
      await config.transform(config, '/deep-clean'),
      await config.transform(config, '/post-construction'),
    ]
  },
}


