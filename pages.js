module.exports = function() {
  return [
    {
      template: 'html/index/index.handlebars',
      filename: `index.html`,
      inject: false
    },
    {
      template: 'html/features/index.handlebars',
      filename: `features.html`,
      inject: false
    },
    {
      template: 'html/pricing/index.handlebars',
      filename: `pricing.html`,
      inject: false
    },
    {
      template: 'html/company/index.handlebars',
      filename: `company.html`,
      inject: false
    },
    {
      template: 'html/customers/index.handlebars',
      filename: `customers.html`,
      inject: false
    },
    {
      template: 'html/docker-hosting/index.handlebars',
      filename: `docker-hosting.html`,
      inject: false
    }
  ]
}
