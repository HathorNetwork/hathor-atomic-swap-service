/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { BinaryToTextEncoding, createHash } from 'crypto';

export function hashString(str: string, encoding: BinaryToTextEncoding = 'hex'): string {
  const hash = createHash('sha256');
  hash.update(str);
  return hash.digest(encoding);
}
