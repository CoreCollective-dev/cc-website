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
    new sst.aws.Astro('CC-Website', {
      //to hide, comment out the below
      // domain: {
      //   name: 'corecollective.dev',
      //   redirects: ['www.corecollective.dev'],
      // },
    });
  },
});
