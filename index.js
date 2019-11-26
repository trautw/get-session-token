#!/usr/bin/env node
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
const token = otplib.authenticator.generate(secret);

const sessionInfoString = child_process.execSync(`aws sts get-session-token --profile ${sourceProfileName} --serial-number ${mfaSerial} --token-code ${token}`).toString();
const sessionInfo = JSON.parse(sessionInfoString);
const credentials = sessionInfo.Credentials;

// console.log(sessionInfo);
// console.log(`export AWS_ACCESS_KEY_ID=${credentials.AccessKeyId}`);
// console.log(`export AWS_SECRET_ACCESS_KEY=${credentials.SecretAccessKey}`);
// console.log(`export AWS_SESSION_TOKEN=${credentials.SessionToken}`);

process.env['AWS_ACCESS_KEY_ID'] = credentials.AccessKeyId;
process.env['AWS_SECRET_ACCESS_KEY'] = credentials.SecretAccessKey;
process.env['AWS_SESSION_TOKEN'] = credentials.SessionToken;

// Now assume role
const roleString = child_process.execSync(`aws sts assume-role --role-arn arn:aws:iam::${awsAccount}:role/${awsRole} --role-session-name $USER-session-$$`).toString();
const role = JSON.parse(roleString);
const roleCredentials = role.Credentials;

// console.log(`export AWS_ACCESS_KEY_ID=${roleCredentials.AccessKeyId}`);
// console.log(`export AWS_SECRET_ACCESS_KEY=${roleCredentials.SecretAccessKey}`);
// console.log(`export AWS_SESSION_TOKEN=${roleCredentials.SessionToken}`);

process.env['AWS_ACCESS_KEY_ID'] =     roleCredentials.AccessKeyId;
process.env['AWS_SECRET_ACCESS_KEY'] = roleCredentials.SecretAccessKey;
process.env['AWS_SESSION_TOKEN'] =     roleCredentials.SessionToken;

child_process.execSync(cmd,{stdio: 'inherit'});
