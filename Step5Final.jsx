import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, Check, PartyPopper } from 'lucide-react';
import { sha256Full, toHex, H_INITIAL } from '@/lib/sha256';

export default function Step5Final({ message, onBack }) {
  const result = sha256Full(message);
  const blockResult = result.blockResults[0];
  const [copied, setCopied] = useState(false);

  const varNames = ['H₀', 'H₁', 'H₂', 'H₃', 'H₄', 'H₅', 'H₆', 'H₇'];

  const copyHash = () => {
    navigator.clipboard.writeText(result.finalHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Final working vars after 64 rounds
  const lastRound = blockResult.rounds[63];
  const workingFinal = [
    lastRound.a_out, lastRound.b_out, lastRound.c_out, lastRound.d_out,
    lastRound.e_out, lastRound.f_out, lastRound.g_out, lastRound.h_out
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <PartyPopper className="w-8 h-8 text-chart-4" />
        </motion.div>
        <div>
          <h2 className="text-xl font-bold">Step 6: Final Hash</h2>
          <p className="text-sm text-muted-foreground">
            Add the compressed values back to the initial hash values.
          </p>
        </div>
      </div>

      {/* Addition table */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-sm font-semibold">Final Addition (mod 2³²)</h3>
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-2 text-xs font-mono text-center">
            <span className="text-muted-foreground">Variable</span>
            <span className="text-muted-foreground">Initial</span>
            <span className="text-muted-foreground">+ Working</span>
            <span className="text-muted-foreground">= Result</span>
          </div>
          {varNames.map((name, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="grid grid-cols-4 gap-2 text-xs font-mono text-center p-2 rounded-lg bg-secondary/50"
            >
              <span className="text-muted-foreground font-semibold">{name}</span>
              <span className="text-muted-foreground">{toHex(H_INITIAL[i])}</span>
              <span className="text-accent">{toHex(workingFinal[i])}</span>
              <span className="text-primary font-semibold">{toHex(result.finalHashArray[i])}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Final hash */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl border border-primary/30 bg-primary/5 p-6 space-y-4 glow-primary"
      >
        <h3 className="text-sm font-semibold text-primary">SHA-256 Digest</h3>
        <div className="flex items-center gap-3">
          <p className="font-mono text-sm text-primary break-all flex-1 leading-relaxed">
            {result.finalHash}
          </p>
          <Button size="sm" variant="outline" onClick={copyHash} className="shrink-0 gap-1 text-xs">
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
          <span>Input: <span className="text-foreground font-mono">"{message}"</span></span>
          <span>Output: <span className="text-foreground font-mono">256 bits (64 hex chars)</span></span>
        </div>
      </motion.div>

      <div className="flex justify-start">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Compression
        </Button>
      </div>
    </motion.div>
  );
}
