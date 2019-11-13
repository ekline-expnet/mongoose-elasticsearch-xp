'use strict';

const es6 = require('es6');
const es7 = require('es7');
const elasticsearch = require('elasticsearch');

function getClientLib(version) {
  if (!version) {
    return es7;
  }
  switch (version) {
    case 6:
      return es6;
    case 7:
      return es7;
    default:
      return elasticsearch;
  }
}

function legacyClient(options) {
  const opts = {};

  if (Array.isArray(options.hosts)) {
    opts.host = options.hosts;
  } else {
    opts.host = {
      host: options.host || '127.0.0.1',
      port: options.port || 9200,
      protocol: options.protocol || 'http',
      auth: options.auth || null,
      keepAlive: false,
    };
  }

  opts.log = options.log || null;

  return new elasticsearch.Client(opts);
}

function newClient(options) {
  let opts = options;

  if (Array.isArray(options.hosts)) {
    opts = options.hosts;
  }
  const newOpts = {
    node: `${opts.protocol || 'http'}://${opts.host ||
      '127.0.0.1'}:${opts.port || 9200}`,
  };
  newOpts.auth = opts.auth || null;

  opts.log = options.log || null;
  const es = getClientLib(options.version);
  const client = new es.Client(newOpts);
  client.version = options.version || 7;
  return client;
}

module.exports = function (options) {
  options.version = options.version || 7;
  if (options.version > 5) {
    return newClient(options);
  }
  return legacyClient(options);
};
