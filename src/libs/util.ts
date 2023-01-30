import { BinaryToTextEncoding, createHash } from 'crypto';

export function hashString(str: string, encoding: BinaryToTextEncoding = 'hex'): string {
  const hash = createHash('sha256');
  hash.update(str);
  return hash.digest(encoding);
}
