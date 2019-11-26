#!/usr/bin/env node
const AWS = require('aws-sdk');
const child_process = require('child_process');
const loadIniFile = require('read-ini-file');
const otplib = require("otplib");
const path = require('path');

const awsAccount = process.argv[2];
const awsRole = process.argv[3];
const cmd = process.argv.slice(4).join(' ');

const profile = `${awsAccount}-${awsRole}`;

const awsSecretsFile = path.join(process.env['HOME'], '.aws', 'credentials');
const awsSecrets = loadIniFile.sync(awsSecretsFile);

const awsConfigFile = path.join(process.env['HOME'], '.aws', 'config');
const awsConfig = loadIniFile.sync(awsConfigFile);

const awsProfile = awsConfig[`profile ${profile}`];
const sourceProfileName = awsProfile.source_profile;

const profileSecrets = awsSecrets[sourceProfileName];
const mfaSerial = awsConfig[`profile ${sourceProfileName}`].mfa_serial;
const secret = profileSecrets.aws_mfa_secret;

AWS.config.credentials = new AWS.Credentials(profileSecrets.aws_access_key_id, profileSecrets.aws_secret_access_key);

const token = otplib.authenticator.generate(secret);
const sts = new AWS.STS();
var params = {
  SerialNumber: mfaSerial, 
  TokenCode: token
};
sts.getSessionToken(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else {
    const credentials = data.Credentials;

    AWS.config.credentials = new AWS.Credentials(credentials.AccessKeyId, credentials.SecretAccessKey, credentials.SessionToken);

    var params = {
      RoleArn: `arn:aws:iam::${awsAccount}:role/${awsRole}`, 
      RoleSessionName: `${process.env['USER']}-session-${process.env['$']}`
    };
    sts.assumeRole(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else {
        const roleCredentials = data.Credentials;

        process.env['AWS_ACCESS_KEY_ID'] =     roleCredentials.AccessKeyId;
        process.env['AWS_SECRET_ACCESS_KEY'] = roleCredentials.SecretAccessKey;
        process.env['AWS_SESSION_TOKEN'] =     roleCredentials.SessionToken;

        child_process.execSync(cmd,{stdio: 'inherit'});
      }
    });
  }
});
