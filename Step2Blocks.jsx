import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimate } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, ChevronDown, Zap } from 'lucide-react';
import { messageToBinary, padMessage, parseBlocks, toHex } from '@/lib/sha256';

// Animated bit-stream header: shows a rolling line of bits, then "slices" them
function BitStream({ paddedBytes, onDone }) {
  const [phase, setPhase] = useState('rolling'); // rolling | slicing | done
  const [displayBits, setDisplayBits] = useState('');
  const [sliceAt, setSliceAt] = useState([]); // byte indices of slice lines
  const intervalRef = useRef(null);

  const allBits = paddedBytes.slice(0, 8).map(b => b.toString(2).padStart(8, '0')).join('');

  useEffect(() => {
    // Roll bits in one by one
    let i = 0;
    intervalRef.current = setInterval(() => {
      i++;
      setDisplayBits(allBits.slice(0, i));
      if (i >= allBits.length) {
        clearInterval(intervalRef.current);
        setTimeout(() => setPhase('slicing'), 300);
      }
    }, 18);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (phase === 'slicing') {
      // Reveal slice markers at bytes 4 and 8 with delay
      let t = 0;
      [4, 8].forEach(byte => {
        setTimeout(() => {
          setSliceAt(prev => [...prev, byte]);
          if (byte === 8) setTimeout(() => { setPhase('done'); onDone(); }, 500);
        }, (t += 450));
      });
    }
  }, [phase]);

  const chars = displayBits.split('');

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bit Stream</span>
        {phase === 'rolling' && (
          <span className="flex gap-0.5">
            {[0,1,2].map(i => (
              <motion.span key={i} className="w-1 h-1 rounded-full bg-primary"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.3 }}
              />
            ))}
          </span>
        )}
        {phase !== 'rolling' && (
          <span className="text-[10px] font-mono text-primary">showing first 8 bytes</span>
        )}
      </div>

      <div className="font-mono text-sm leading-relaxed flex flex-wrap gap-0 relative">
        {chars.map((bit, i) => {
          const byteIdx = Math.floor(i / 8) + 1; // 1-indexed
          const isSliced = sliceAt.includes(byteIdx) && i === byteIdx * 8 - 1;
          const groupIdx = Math.floor(i / 32); // 32-bit word group (0=W0, 1=W1)
          const wordColors = ['text-primary', 'text-accent', 'text-chart-3', 'text-chart-4'];

          return (
            <span key={i} className="relative">
              <motion.span
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.08 }}
                className={`${
                  phase === 'slicing' || phase === 'done'
                    ? wordColors[groupIdx % 4]
                    : 'text-foreground'
                } transition-colors duration-500`}
              >
                {bit}
              </motion.span>
              {/* space between bytes */}
              {(i + 1) % 8 === 0 && i < chars.length - 1 && (
                <span className="text-muted-foreground/30">
                  {sliceAt.includes(Math.floor(i / 8) + 1) ? (
                    <motion.span
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      className="inline-block text-chart-5 font-bold mx-0.5"
                    >|</motion.span>
                  ) : ' '}
                </span>
              )}
            </span>
          );
        })}
        {phase === 'rolling' && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className="text-primary font-bold"
          >▌</motion.span>
        )}
      </div>

      {phase === 'done' && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-muted-foreground"
        >
          Every <span className="text-primary font-semibold">32 bits</span> = one 32-bit word. 
          Every <span className="text-accent font-semibold">512 bits</span> = one block (16 words).
        </motion.p>
      )}
    </div>
  );
}

// Word row with hover expand
function WordRow({ word, index, delay }) {
  const [hovered, setHovered] = useState(false);
  const hexStr = toHex(word);
  const binStr = (word >>> 0).toString(2).padStart(32, '0');
  const bytes = [hexStr.slice(0,2), hexStr.slice(2,4), hexStr.slice(4,6), hexStr.slice(6,8)];
  const byteColors = ['text-primary', 'text-accent', 'text-chart-3', 'text-chart-4'];

  return (
    <motion.div
      initial={{ opacity: 0, x: -24, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 220, damping: 20 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="rounded-lg overflow-hidden cursor-default"
    >
      <div className={`flex items-center gap-3 p-2.5 transition-colors ${hovered ? 'bg-secondary' : 'bg-secondary/50'}`}>
        {/* Word label */}
        <motion.span
          animate={{ color: hovered ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
          className="font-mono text-xs w-8 font-semibold"
        >
          W{index.toString().padStart(2, '0')}
        </motion.span>

        {/* Hex bytes with individual color */}
        <div className="flex gap-1 font-mono text-sm">
          {bytes.map((b, bi) => (
            <motion.span
              key={bi}
              animate={{
                color: hovered
                  ? ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(60 80% 55%)', 'hsl(45 90% 55%)'][bi]
                  : 'hsl(var(--primary))',
                scale: hovered ? 1.08 : 1,
              }}
              transition={{ duration: 0.2, delay: bi * 0.04 }}
            >
              {b}
            </motion.span>
          ))}
        </div>

        {/* Binary — visible on hover */}
        <motion.div
          className="hidden sm:block overflow-hidden flex-1"
          animate={{ opacity: hovered ? 1 : 0.3 }}
          transition={{ duration: 0.2 }}
        >
          <span className="font-mono text-[10px] text-muted-foreground tracking-widest">
            {binStr.replace(/(.{8})/g, '$1 ').trim()}
          </span>
        </motion.div>

        {/* Size hint */}
        <AnimatePresence>
          {hovered && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 shrink-0"
            >
              32 bits
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Expanded byte breakdown on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-secondary/30 border-t border-border/40"
          >
            <div className="px-3 py-2 flex gap-4">
              {bytes.map((b, bi) => (
                <motion.div
                  key={bi}
                  initial={{ y: 4, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: bi * 0.05 }}
                  className="text-center"
                >
                  <p className={`font-mono text-sm font-bold ${byteColors[bi]}`}>0x{b}</p>
                  <p className="font-mono text-[9px] text-muted-foreground mt-0.5">
                    {parseInt(b, 16).toString(2).padStart(8, '0')}
                  </p>
                  <p className="text-[9px] text-muted-foreground">byte {bi}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Block size visualizer — animated 4×4 grid of word squares
function BlockGrid({ block, onWordHover }) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {block.map((word, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 + i * 0.04, type: 'spring', stiffness: 260, damping: 22 }}
          onHoverStart={() => onWordHover(i)}
          onHoverEnd={() => onWordHover(null)}
          whileHover={{ scale: 1.12, zIndex: 10 }}
          className="relative aspect-square rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center cursor-default"
        >
          <span className="font-mono text-[9px] text-primary font-bold">W{i.toString().padStart(2,'0')}</span>
          <motion.div
            className="absolute inset-0 rounded-md bg-primary/20 border border-primary/40"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          />
        </motion.div>
      ))}
    </div>
  );
}

export default function Step2Blocks({ message, onComplete, onBack }) {
  const { bytes } = messageToBinary(message);
  const { padded } = padMessage(bytes);
  const blocks = parseBlocks(padded);
  const [selectedBlock, setSelectedBlock] = useState(0);
  const [phase, setPhase] = useState('stream'); // stream | words
  const [hoveredWord, setHoveredWord] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold mb-2">Step 3: Parse into Blocks</h2>
        <p className="text-sm text-muted-foreground">
          The padded message is split into <span className="text-foreground font-semibold">512-bit blocks</span>.
          Each block contains <span className="text-foreground font-semibold">16 × 32-bit words</span>.
        </p>
      </div>

      {/* Animated bit stream */}
      <BitStream paddedBytes={padded} onDone={() => setPhase('words')} />

      {/* Block overview: grid + stats */}
      <AnimatePresence>
        {phase === 'words' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Stats banner */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Blocks', value: blocks.length, color: 'text-primary' },
                { label: 'Words / block', value: 16, color: 'text-accent' },
                { label: 'Bits / word', value: 32, color: 'text-chart-3' },
              ].map(({ label, value, color }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, type: 'spring' }}
                  className="rounded-xl border border-border bg-card p-4 text-center"
                >
                  <motion.p
                    className={`text-3xl font-black ${color}`}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.1, type: 'spring', stiffness: 300 }}
                  >
                    {value}
                  </motion.p>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </motion.div>
              ))}
            </div>

            {/* Block selector */}
            {blocks.length > 1 && (
              <div className="flex gap-2">
                {blocks.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedBlock(i)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedBlock === i
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    }`}
                  >
                    Block {i}
                  </button>
                ))}
              </div>
            )}

            {/* Two-column layout: grid + word list */}
            <div className="grid md:grid-cols-[160px_1fr] gap-5 items-start">
              {/* Visual block grid */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground">Block {selectedBlock} (16 words)</p>
                <BlockGrid block={blocks[selectedBlock]} onWordHover={setHoveredWord} />
                <p className="text-[10px] text-muted-foreground">Hover a word</p>
              </div>

              {/* Word list */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-1">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-muted-foreground">32-bit words — hover to inspect</p>
                  <AnimatePresence>
                    {hoveredWord !== null && (
                      <motion.span
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded"
                      >
                        W{hoveredWord.toString().padStart(2,'0')} selected
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <div className="space-y-0.5 max-h-96 overflow-y-auto pr-1">
                  {blocks[selectedBlock].map((word, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        backgroundColor: hoveredWord === i
                          ? 'hsl(var(--primary) / 0.08)'
                          : 'transparent',
                        borderColor: hoveredWord === i
                          ? 'hsl(var(--primary) / 0.3)'
                          : 'transparent',
                      }}
                      className="rounded-lg border"
                    >
                      <WordRow word={word} index={i} delay={i * 0.025} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Insight callout */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-start gap-3 p-4 rounded-xl border border-accent/30 bg-accent/5"
            >
              <Zap className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                These <span className="text-foreground font-semibold">16 words (W₀–W₁₅)</span> are the seed for the message schedule. 
                In the next step they'll be <span className="text-accent font-semibold">expanded to 64 words</span> using bitwise rotation functions.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button
          onClick={onComplete}
          disabled={phase !== 'words'}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        >
          Continue to Schedule <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
