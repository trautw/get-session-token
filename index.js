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

const otplib = __importStar(require("otplib"));

console.log(process.argv[1]);
const secret = 'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD'
const token = otplib.authenticator.generate(secret);

console.log(token);
