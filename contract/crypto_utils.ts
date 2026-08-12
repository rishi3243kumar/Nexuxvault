/**
 * Lightweight deterministic cryptographic helper for Midnight Compact circuit simulations
 */
export const crypto = {
  hash: (data: string): string => {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `0x${hex}${hex}${hex}${hex}`.substring(0, 34);
  },

  hashSecret: (secret: string): string => {
    return crypto.hash(`VEILPASS_SECRET_COMMITMENT:${secret}`);
  },

  hashConcat: (a: string, b: string): string => {
    return crypto.hash(`NODE:${a}:${b}`);
  },

  hashNullifier: (secret: string, salt: string): string => {
    return crypto.hash(`NULLIFIER:${secret}:${salt}`);
  }
};
