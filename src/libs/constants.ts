/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Number of iterations to execute when hashing the password
 *
 * NIST recommends at least 10,000 iterations (https://pages.nist.gov/800-63-3/sp800-63b.html#sec5),
 */
export const HASH_ITERATIONS = 10000;

/**
 * Size of the key to hash the password
 */
export const HASH_KEY_SIZE = 256;
