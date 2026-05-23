import { generateTotpHash } from "../generateTotpHash";

describe("generateTotpHash", () => {
  it("returns a 6-digit string", () => {
    const code = generateTotpHash("test-secret");
    expect(code).toHaveLength(6);
    expect(/^\d{6}$/.test(code)).toBe(true);
  });

  it("returns the same code within the same time window", () => {
    const code1 = generateTotpHash("my-secret", 60);
    const code2 = generateTotpHash("my-secret", 60);
    expect(code1).toBe(code2);
  });

  it("returns different codes for different secrets", () => {
    const code1 = generateTotpHash("secret-a");
    const code2 = generateTotpHash("secret-b");
    expect(code1).not.toBe(code2);
  });
});
