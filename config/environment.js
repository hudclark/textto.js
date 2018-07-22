/* eslint-env node */
'use strict';

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'textto',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };

  ENV.APP_VERSION = "1.4.0"

  ENV.wsHost = 'wss://api.sendleap.com';
  ENV.host = 'https://api.sendleap.com';

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;


    ENV.wsHost = 'ws://localhost:8000';
    ENV.host = 'http://localhost:8000';
    ENV.STRIPE_KEY = 'pk_test_kjjLg1dXinEQM3N2TlR4Ex2E'
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';

  }

  if (environment === 'production') {
    ENV.wsHost = 'wss://api.sendleap.com';
    ENV.host = 'https://api.sendleap.com';
    ENV.STRIPE_KEY = 'pk_live_pY7sZp5rogmET3hiixAZ1VEe'
  }

  return ENV;
};
