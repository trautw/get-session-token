#!/usr/bin/env node
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k))
result[k] = mod[k];
    result["default"] = mod;
    return result;
};

const loadIniFile = require('read-ini-file');
const otplib = __importStar(require("otplib"));
const path = require('path');

const profile = process.argv[2];
console.log(`Profile: ${profile}`);

const awsSecretsFile = path.join(process.env['HOME'], '.aws', 'credentials');
const awsSecrets = loadIniFile.sync(awsSecretsFile);
const profileSecrets = awsSecrets[profile];
console.log(profileSecrets);

const secret = profileSecrets.aws_mfa_secret;
const token = otplib.authenticator.generate(secret);

console.log(token);
