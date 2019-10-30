#!/usr/bin/env node
const child_process = require('child_process');
const loadIniFile = require('read-ini-file');
const otplib = require("otplib");
const path = require('path');

const profile = process.argv[2];

const awsSecretsFile = path.join(process.env['HOME'], '.aws', 'credentials');
const awsSecrets = loadIniFile.sync(awsSecretsFile);
const profileSecrets = awsSecrets[profile];
const secret = profileSecrets.aws_mfa_secret;
const token = otplib.authenticator.generate(secret);
console.log(token);

const sessionInfo = child_process.execSync(`aws sts get-session-token --profile ${profile} --serial-number ${mfaSerial} --token-code ${token}`);

console.log(sessionInfo);
