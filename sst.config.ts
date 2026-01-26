/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'cc-website',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws',
      providers: {
        aws: {
          region: 'eu-west-1',
        },
      },
    };
  },
  async run() {
    const domain =
      $app.stage === 'production'
        ? {
            name: 'corecollective.dev',
            dns: sst.aws.dns(),
            redirects: ['www.corecollective.dev'],
          }
        : undefined;
    new sst.aws.Astro('CC-Website', {
      // domain: domain,
    });
  },
});
