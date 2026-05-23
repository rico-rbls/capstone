import { calculatePenalty } from "../calculatePenalty";

describe("calculatePenalty", () => {
  it("returns 0 when the book is returned on time", () => {
    const dueDate = new Date("2025-06-10");
    const returnDate = new Date("2025-06-10");
    expect(calculatePenalty(dueDate, returnDate)).toBe(0);
  });

  it("returns 0 when the book is returned early", () => {
    const dueDate = new Date("2025-06-10");
    const returnDate = new Date("2025-06-08");
    expect(calculatePenalty(dueDate, returnDate)).toBe(0);
  });

  it("calculates penalty for overdue days at default rate", () => {
    const dueDate = new Date("2025-06-01");
    const returnDate = new Date("2025-06-04");
    // 3 days overdue × 5 = 15
    expect(calculatePenalty(dueDate, returnDate)).toBe(15);
  });

  it("calculates penalty with a custom daily rate", () => {
    const dueDate = new Date("2025-06-01");
    const returnDate = new Date("2025-06-06");
    // 5 days overdue × 10 = 50
    expect(calculatePenalty(dueDate, returnDate, 10)).toBe(50);
  });
});
