/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//-------------------------------------------------------
// IMPORTANT:
// The HASH_ITERATIONS and HASH_KEY_SIZE constants below determine how the hashed auth passwords are generated and, most importantly, validated.
// Changing any of these values will make all existing passwords on the database invalid and deny access to them to all the proposals users.
//-------------------------------------------------------

/**
 * Number of iterations to execute when hashing the password
 *
 * NIST recommends at least 10,000 iterations (https://pages.nist.gov/800-63-3/sp800-63b.html#sec5),
 * @see Comment above before changing this value
 */
export const HASH_ITERATIONS = 1000;

/**
 * Size of the key to hash the password
 * @see Comment above before changing this value
 */
export const HASH_KEY_SIZE = 256;

export const AUTHPASSWORD_HEADER_KEY = 'X-Auth-Password';
