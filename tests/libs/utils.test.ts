import { hashPassword, validatePassword } from '../../src/libs/util';

describe('password utils', () => {
  it('should generate passwords with a specified salt', () => {
    const plainPassword = '123';
    const salt = '456';
    const { hashedPass: pass1 } = hashPassword(plainPassword, salt);
    expect(validatePassword(plainPassword, pass1, salt)).toBe(true);
  })

  it('should generate passwords with a random salt', () => {
    const plainPassword = '123';
    const { hashedPass: pass1, salt: randomSalt } = hashPassword(plainPassword);
    expect(validatePassword(plainPassword, pass1, randomSalt)).toBe(true);
  })
})
