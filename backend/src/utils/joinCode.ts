import crypto from 'crypto';

/**
 * Generate a random 8-character alphanumeric join code
 * Format: XXXX-XXXX for better readability
 */
export function generateJoinCode(): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking characters
  let code = '';

  for (let i = 0; i < 8; i++) {
    const randomIndex = crypto.randomInt(0, characters.length);
    code += characters[randomIndex];
  }

  // Format as XXXX-XXXX
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

/**
 * Validate join code format
 */
export function isValidJoinCodeFormat(code: string): boolean {
  // Check format: XXXX-XXXX (8 alphanumeric characters with hyphen)
  const regex = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return regex.test(code);
}
