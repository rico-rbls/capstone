import { formatDateTz } from "../formatDateTz";

describe("formatDateTz", () => {
  it("formats a date in the default locale", () => {
    const date = new Date("2025-03-15T10:30:00Z");
    const result = formatDateTz(date, "UTC");
    expect(result).toContain("Mar");
    expect(result).toContain("15");
    expect(result).toContain("2025");
  });

  it("respects the provided timezone", () => {
    const date = new Date("2025-03-15T23:30:00Z");
    // In Asia/Manila (UTC+8), this is already March 16
    const result = formatDateTz(date, "Asia/Manila");
    expect(result).toContain("16");
  });

  it("uses the specified locale", () => {
    const date = new Date("2025-01-05T12:00:00Z");
    const result = formatDateTz(date, "UTC", "en-GB");
    // en-GB uses day before month
    expect(result).toContain("5");
    expect(result).toContain("Jan");
  });
});
