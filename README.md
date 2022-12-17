## Encryption Utility
[![npm](https://img.shields.io/npm/dm/encryption.js?color=%23a5f&label=npm) ![npm](https://img.shields.io/npm/v/encryption.js?color=%23a5f&label=encryption.js%40latest)](https://www.npmjs.com/package/encryption.js)
---
simple encryption class for node apps, allows setting app secret & set purpose of encryption, inspired from adonis encryption feature

## Quick Start

```ts
// Create Static Encryption constant
// src/lib/Encryption.ts
import { default as AppEncryption } from 'encryption.js';
const Encryption = new AppEncryption({ secret: process.env.APP_SECRET })
export default Encryption;

// usage
// src/app.ts or any other ts to use

import Encryption from './lib/Encryption';

// encrypt payload with a expiry date & purpose which acts like a salt, decrypting will require the purpose to return the encrypted object, otherwise null
const token = Encryption.encrypt({ userId: "<some id>" }, Date.now() + 1000 * 60 * 60, "emailVerify");

// some user <> server things

// server handles payload
const payload = Encryption.decrypt(token, "emailVerify");

```
