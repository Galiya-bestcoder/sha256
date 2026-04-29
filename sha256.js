// SHA-256 step-by-step implementation for educational purposes

// Initial hash values (first 32 bits of fractional parts of square roots of first 8 primes)
export const H_INITIAL = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
];

// Round constants (first 32 bits of fractional parts of cube roots of first 64 primes)
export const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
  0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
  0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
  0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
  0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
  0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

export function toHex(num) {
  return (num >>> 0).toString(16).padStart(8, '0');
}

export function toBin(num) {
  return (num >>> 0).toString(2).padStart(32, '0');
}

// Right rotate
export function rotr(n, x) {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

// Right shift
export function shr(n, x) {
  return (x >>> n) >>> 0;
}

// SHA-256 functions
export function Ch(x, y, z) {
  return ((x & y) ^ (~x & z)) >>> 0;
}

export function Maj(x, y, z) {
  return ((x & y) ^ (x & z) ^ (y & z)) >>> 0;
}

export function Sigma0(x) {
  return (rotr(2, x) ^ rotr(13, x) ^ rotr(22, x)) >>> 0;
}

export function Sigma1(x) {
  return (rotr(6, x) ^ rotr(11, x) ^ rotr(25, x)) >>> 0;
}

export function sigma0(x) {
  return (rotr(7, x) ^ rotr(18, x) ^ shr(3, x)) >>> 0;
}

export function sigma1(x) {
  return (rotr(17, x) ^ rotr(19, x) ^ shr(10, x)) >>> 0;
}

export function add32(...args) {
  let sum = 0;
  for (const a of args) sum = (sum + a) >>> 0;
  return sum;
}

// Step 1: Convert message to binary
export function messageToBinary(message) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(message);
  const bits = [];
  for (const byte of bytes) {
    bits.push(byte.toString(2).padStart(8, '0'));
  }
  return { bytes: Array.from(bytes), bits, totalBits: bytes.length * 8 };
}

// Step 2: Pad the message
export function padMessage(bytes) {
  const msgLenBits = bytes.length * 8;
  const padded = [...bytes];
  
  // Append bit '1' (0x80)
  padded.push(0x80);
  
  // Append zeros until length ≡ 448 mod 512 (in bits), i.e. 56 mod 64 in bytes
  while (padded.length % 64 !== 56) {
    padded.push(0x00);
  }
  
  // Append original length as 64-bit big-endian
  const lenHigh = Math.floor(msgLenBits / 0x100000000);
  const lenLow = msgLenBits & 0xFFFFFFFF;
  padded.push((lenHigh >>> 24) & 0xff, (lenHigh >>> 16) & 0xff, (lenHigh >>> 8) & 0xff, lenHigh & 0xff);
  padded.push((lenLow >>> 24) & 0xff, (lenLow >>> 16) & 0xff, (lenLow >>> 8) & 0xff, lenLow & 0xff);
  
  return { padded, originalLength: bytes.length, paddedLength: padded.length, msgLenBits };
}

// Step 3: Parse into 512-bit blocks
export function parseBlocks(padded) {
  const blocks = [];
  for (let i = 0; i < padded.length; i += 64) {
    const block = padded.slice(i, i + 64);
    // Convert to 16 32-bit words
    const words = [];
    for (let j = 0; j < 64; j += 4) {
      words.push(((block[j] << 24) | (block[j+1] << 16) | (block[j+2] << 8) | block[j+3]) >>> 0);
    }
    blocks.push(words);
  }
  return blocks;
}

// Step 4: Create message schedule (expand 16 words to 64)
export function createMessageSchedule(block) {
  const W = [...block]; // first 16 words
  const steps = [];
  
  for (let t = 16; t < 64; t++) {
    const s0 = sigma0(W[t-15]);
    const s1 = sigma1(W[t-2]);
    W[t] = add32(s1, W[t-7], s0, W[t-16]);
    steps.push({
      t,
      wt_minus_2: W[t-2],
      wt_minus_7: W[t-7],
      wt_minus_15: W[t-15],
      wt_minus_16: W[t-16],
      sigma0_val: s0,
      sigma1_val: s1,
      result: W[t]
    });
  }
  
  return { schedule: W, steps };
}

// Step 5: Compression - single round
export function compressionRound(a, b, c, d, e, f, g, h, Kt, Wt, roundNum) {
  const ch = Ch(e, f, g);
  const maj = Maj(a, b, c);
  const sig0 = Sigma0(a);
  const sig1 = Sigma1(e);
  const T1 = add32(h, sig1, ch, Kt, Wt);
  const T2 = add32(sig0, maj);
  
  return {
    round: roundNum,
    // inputs
    a_in: a, b_in: b, c_in: c, d_in: d,
    e_in: e, f_in: f, g_in: g, h_in: h,
    Kt, Wt,
    // intermediates
    ch, maj, sig0, sig1, T1, T2,
    // outputs
    a_out: add32(T1, T2),
    b_out: a,
    c_out: b,
    d_out: c,
    e_out: add32(d, T1),
    f_out: e,
    g_out: f,
    h_out: g
  };
}

// Full compression for one block
export function compressBlock(block, hashValues) {
  const { schedule } = createMessageSchedule(block);
  let [a, b, c, d, e, f, g, h] = hashValues;
  const rounds = [];
  
  for (let t = 0; t < 64; t++) {
    const round = compressionRound(a, b, c, d, e, f, g, h, K[t], schedule[t], t);
    rounds.push(round);
    a = round.a_out;
    b = round.b_out;
    c = round.c_out;
    d = round.d_out;
    e = round.e_out;
    f = round.f_out;
    g = round.g_out;
    h = round.h_out;
  }
  
  const newHash = [
    add32(hashValues[0], a),
    add32(hashValues[1], b),
    add32(hashValues[2], c),
    add32(hashValues[3], d),
    add32(hashValues[4], e),
    add32(hashValues[5], f),
    add32(hashValues[6], g),
    add32(hashValues[7], h),
  ];
  
  return { rounds, schedule, newHash };
}

// Full SHA-256 with all steps
export function sha256Full(message) {
  const step1 = messageToBinary(message);
  const step2 = padMessage(step1.bytes);
  const step3 = parseBlocks(step2.padded);
  
  let currentHash = [...H_INITIAL];
  const blockResults = [];
  
  for (let i = 0; i < step3.length; i++) {
    const result = compressBlock(step3[i], currentHash);
    blockResults.push({
      blockIndex: i,
      inputHash: [...currentHash],
      ...result
    });
    currentHash = result.newHash;
  }
  
  const finalHash = currentHash.map(toHex).join('');
  
  return {
    message,
    step1,
    step2,
    step3,
    blockResults,
    finalHash,
    finalHashArray: currentHash
  };
}

// Quick hash for comparison
export function sha256Quick(message) {
  return sha256Full(message).finalHash;
}
