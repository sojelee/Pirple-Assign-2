const environments = {};

environments.staging = {
  'httpPort': 8080,
  'httpsPort' : 8081,
  'envName': 'staging',
  'hashingSecret':'thisIsASecret',
}

environments.production = {
  'httpPort': 5080,
  'httpsPort': 5081,
  'envName': 'production',
  'hashingSecret':'thisIsASecret',
}

const currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

const envToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = envToExport;
