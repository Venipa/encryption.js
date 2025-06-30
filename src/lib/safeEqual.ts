
export function timingSafeEqual(a: Buffer, b: Buffer) {
  if (!Buffer.isBuffer(a)) {
    throw new TypeError('First argument must be a buffer');
  }
  if (!Buffer.isBuffer(b)) {
    throw new TypeError('Second argument must be a buffer');
  }
  if (a.length !== b.length) {
    return false;
  }
  var len = a.length;
  var out = 0;
  var i = -1;
  while (++i < len) {
    out |= a[i] ^ b[i];
  }
  return out === 0;
}
export function safeEqual<P1 extends string, P2 extends string>(trustedValue: P1, userInput: P2) {
  return timingSafeEqual(Buffer.from(trustedValue), Buffer.from(userInput));
}