import Encryption from './';
const enc = new Encryption({secret: "test"});
describe('encrypt', () => {
  it('works', () => {
    const obj = { test: 1 };
    const first = enc.encrypt(obj),
    last: typeof obj | null = enc.decrypt(first);
    expect(last).not.toBeNull();
  });
});
