import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, Hash, Binary, Layers, RotateCw, Sigma, Shield } from 'lucide-react';
import { H_INITIAL, K, toHex } from '@/lib/sha256';

const sections = [
  {
    id: 'overview',
    icon: Hash,
    title: '1. What is SHA-256?',
    content: `SHA-256 (Secure Hash Algorithm 256-bit) belongs to the SHA-2 family, designed by the NSA and published in 2001. It takes any input and produces a fixed 256-bit (32-byte) hash digest.

**Key concept:** A hash function is a one-way function — you can compute the hash from the input, but you cannot recover the input from the hash.

**Where is it used?**
• Bitcoin mining and blockchain verification
• Digital signatures and certificate validation
• Password hashing (combined with salting)
• File integrity verification (checksums)
• TLS/SSL handshake protocols`,
  },
  {
    id: 'preprocessing',
    icon: Binary,
    title: '2. Preprocessing: Padding',
    content: `Before hashing, the message must be padded to a multiple of 512 bits. This step is critical because SHA-256 processes data in 512-bit blocks.

**Padding procedure:**
1. Convert the message to binary (UTF-8 encoding)
2. Append a single '1' bit
3. Append '0' bits until length ≡ 448 (mod 512)
4. Append the original message length as a 64-bit big-endian integer

**Example:** For the message "abc" (24 bits):
• Binary: 01100001 01100010 01100011
• After '1' bit: ...01100011 1
• After zero padding: fills up to 448 bits
• Append length (24 in 64-bit): 00...011000
• Total: exactly 512 bits (one block)

This ensures the algorithm always has complete blocks to process.`,
  },
  {
    id: 'blocks',
    icon: Layers,
    title: '3. Parsing into Blocks',
    content: `After padding, the message is divided into 512-bit (64-byte) blocks. Each block is further split into sixteen 32-bit words (W₀ to W₁₅).

**Block structure:**
• Each 512-bit block = 16 words × 32 bits
• Words are read in big-endian byte order
• These 16 words are the starting point for the message schedule

**Multiple blocks:** If the padded message is longer than 512 bits, it gets split into multiple blocks. Each block is processed sequentially, with the output hash of one block feeding into the next.`,
  },
  {
    id: 'schedule',
    icon: RotateCw,
    title: '4. Message Schedule',
    content: `The 16 initial words are expanded to 64 words (W₀ to W₆₃) using the message schedule. This "stretches" the input data to provide unique values for each of the 64 compression rounds.

**Expansion formula (for t = 16 to 63):**
Wₜ = σ₁(Wₜ₋₂) + Wₜ₋₇ + σ₀(Wₜ₋₁₅) + Wₜ₋₁₆

**Small sigma functions (σ₀ and σ₁):**
• σ₀(x) = ROTR⁷(x) ⊕ ROTR¹⁸(x) ⊕ SHR³(x)
• σ₁(x) = ROTR¹⁷(x) ⊕ ROTR¹⁹(x) ⊕ SHR¹⁰(x)

**Key operations:**
• ROTR^n = Right rotation by n bits (bits wrap around)
• SHR^n = Right shift by n bits (zeros fill from left)
• ⊕ = XOR (exclusive or)
• All arithmetic is modulo 2³² (32-bit unsigned)`,
  },
  {
    id: 'compression',
    icon: Sigma,
    title: '5. Compression Function',
    content: `The heart of SHA-256. 64 rounds of compression transform 8 working variables (a through h), initialized from the current hash values.

**Each round computes:**
• T₁ = h + Σ₁(e) + Ch(e,f,g) + Kₜ + Wₜ
• T₂ = Σ₀(a) + Maj(a,b,c)
• Then shift: h←g, g←f, f←e, e←d+T₁, d←c, c←b, b←a, a←T₁+T₂

**Big Sigma functions (Σ₀ and Σ₁):**
• Σ₀(a) = ROTR²(a) ⊕ ROTR¹³(a) ⊕ ROTR²²(a)
• Σ₁(e) = ROTR⁶(e) ⊕ ROTR¹¹(e) ⊕ ROTR²⁵(e)

**Choice and Majority functions:**
• Ch(e,f,g) = (e AND f) XOR (NOT e AND g) — "if e then f else g"
• Maj(a,b,c) = (a AND b) XOR (a AND c) XOR (b AND c) — majority vote

**Round constants Kₜ:** 64 pre-computed constants derived from cube roots of the first 64 primes. These add non-linearity and prevent patterns.`,
  },
  {
    id: 'finalization',
    icon: Shield,
    title: '6. Final Hash',
    content: `After all 64 rounds complete for a block, the working variables are added back to the previous hash values (modulo 2³²).

**Update formula:**
H₀ = H₀ + a, H₁ = H₁ + b, ... H₇ = H₇ + h

If there are more blocks, these updated hash values become the starting point for the next block's compression.

**After all blocks are processed:**
The final hash is the concatenation of H₀ through H₇ in hexadecimal:
Hash = H₀ ‖ H₁ ‖ H₂ ‖ H₃ ‖ H₄ ‖ H₅ ‖ H₆ ‖ H₇

This produces the final 256-bit (64 hex character) digest.

**Initial hash values H₀–H₇** are derived from the fractional parts of the square roots of the first 8 prime numbers (2, 3, 5, 7, 11, 13, 17, 19).`,
  },
];

function ConstantsTable({ title, values, cols = 8 }) {
  const [expanded, setExpanded] = useState(false);
  const display = expanded ? values : values.slice(0, cols * 2);

  return (
    <div className="mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 mb-3 transition-colors"
      >
        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        {title} ({values.length} values)
      </button>
      <div className={`grid gap-1 font-mono text-xs`} style={{ gridTemplateColumns: `repeat(${Math.min(cols, 4)}, minmax(0, 1fr))` }}>
        {display.map((val, i) => (
          <div key={i} className="px-2 py-1.5 rounded bg-secondary text-center text-muted-foreground">
            <span className="text-foreground/40 mr-1">{i}:</span>
            {toHex(val)}
          </div>
        ))}
      </div>
      {!expanded && values.length > cols * 2 && (
        <p className="text-xs text-muted-foreground mt-2">
          + {values.length - cols * 2} more...
        </p>
      )}
    </div>
  );
}

function SectionCard({ section, isOpen, onToggle }) {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-6 text-left hover:bg-secondary/50 transition-colors"
      >
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <section.icon className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-bold flex-1">{section.title}</h3>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-0">
              <div className="pl-14 space-y-3">
                {section.content.split('\n\n').map((para, i) => {
                  if (para.startsWith('**') && para.includes(':**')) {
                    const [title, ...rest] = para.split('\n');
                    return (
                      <div key={i}>
                        <p className="text-sm font-semibold text-foreground mb-1">
                          {title.replace(/\*\*/g, '')}
                        </p>
                        {rest.map((line, j) => (
                          <p key={j} className="text-sm text-muted-foreground leading-relaxed">
                            {line.startsWith('•') ? (
                              <span className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span>{line.slice(2)}</span>
                              </span>
                            ) : line}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return (
                    <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                      {para.split('**').map((part, j) =>
                        j % 2 === 1 ? <strong key={j} className="text-foreground font-semibold">{part}</strong> : part
                      )}
                    </p>
                  );
                })}

                {section.id === 'overview' && (
                  <ConstantsTable title="Initial Hash Values (H₀–H₇)" values={H_INITIAL} cols={4} />
                )}
                {section.id === 'compression' && (
                  <ConstantsTable title="Round Constants (K₀–K₆₃)" values={K} cols={4} />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Theory() {
  const [openSections, setOpenSections] = useState(new Set(['overview']));

  const toggleSection = (id) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-black mb-2">Algorithm Theory</h1>
        <p className="text-muted-foreground">
          Understand every step of SHA-256, from input to final digest.
        </p>
      </motion.div>

      <div className="space-y-3">
        {sections.map((section, i) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <SectionCard
              section={section}
              isOpen={openSections.has(section.id)}
              onToggle={() => toggleSection(section.id)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
