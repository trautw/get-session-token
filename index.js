#!/usr/bin/env node
const child_process = require('child_process');
const loadIniFile = require('read-ini-file');
const otplib = require("otplib");
const path = require('path');

const profile = process.argv[2];

const awsSecretsFile = path.join(process.env['HOME'], '.aws', 'credentials');
const awsSecrets = loadIniFile.sync(awsSecretsFile);

const awsConfigFile = path.join(process.env['HOME'], '.aws', 'config');
const awsConfig = loadIniFile.sync(awsConfigFile);

const awsProfile = awsConfig[profile];
console.log(awsProfile);
const sourceProfile = awsProfile.source_profile;

const profileSecrets = awsSecrets[sourceProfile];
const mfaSerial = profileSecrets.mfa_serial;
const secret = profileSecrets.aws_mfa_secret;
const token = otplib.authenticator.generate(secret);
console.log(token);

const sessionInfo = child_process.execSync(`aws sts get-session-token --profile ${profile} --serial-number ${mfaSerial} --token-code ${token}`);

console.log(sessionInfo);
