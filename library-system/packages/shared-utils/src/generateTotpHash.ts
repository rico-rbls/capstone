// packages/shared-utils/src/generateTotpHash.ts
import * as OTPAuth from 'otpauth';

export const verifyStudentQR = (secret: string, scannedToken: string): boolean => {
  // Create a TOTP instance tied to the student's unique secret
  let totp = new OTPAuth.TOTP({
    issuer: "LibLog",
    label: "Student Attendance",
    algorithm: "SHA1",
    digits: 6,
    period: 30, // The exact 30-second refresh constraint
    secret: OTPAuth.Secret.fromBase32(secret),
  });

  // Validate the token. "window: 1" allows 30 seconds of leniency in case of network delay
  let delta = totp.validate({ token: scannedToken, window: 1 });
  
  return delta !== null; 
};