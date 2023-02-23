/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as CryptoJS from 'crypto-js';
import { HASH_ITERATIONS, HASH_KEY_SIZE } from '@libs/constants';

export function generateRandomSalt(): string {
  return CryptoJS.lib.WordArray.random(128 / 8).toString();
}

/**
 * Get the hash of a password (hmac + salt)
 *
 * @param {string} password Password to be hashed
 * @param {string} [salt] Salt to be used when hashing the password. If not passed, the default one is used
 */
export function hashPassword(password, salt?) {
  const passSalt = salt || generateRandomSalt();

  // NIST has issued Special Publication SP 800-132 recommending PBKDF2
  // For further information, see https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf
  // The default hash algorithm used by CryptoJS.PBKDF2 is SHA1
  // https://github.com/brix/crypto-js/blob/develop/src/pbkdf2.js#L24
  const hashedPass = CryptoJS.PBKDF2(password, passSalt, {
    keySize: HASH_KEY_SIZE / 32,
    iterations: HASH_ITERATIONS,
  }).toString();

  return { hashedPass, salt: passSalt };
}

/**
 * @param {string} plainPassword What the caller thinks is the original password
 * @param {string} hashedPassword The hashed password we use to compare
 * @param {string} salt The password salt we use to compare
 * @returns {boolean} if the data matches
 */
export function validatePassword(
  plainPassword: string,
  hashedPassword: string,
  salt: string,
): boolean {
  const { hashedPass: hashedInput } = hashPassword(plainPassword, salt);
  return hashedInput === hashedPassword;
}
