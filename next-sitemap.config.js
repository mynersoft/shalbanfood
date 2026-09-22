/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://mahirstore.vercel.app', // Replace with your actual domain
  generateRobotsTxt: true,           // Automatically generates robots.txt
  sitemapSize: 5000,                 // Split sitemap into multiple files if more than 5000 URLs
  changefreq: 'monthly',             // Optional: how often search engines should crawl
  priority: 0.8,                     // Optional: page priority in sitemap
  exclude: ['/admin/*', '/secret'],  // Optional: pages to exclude from sitemap
};