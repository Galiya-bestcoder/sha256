import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { messageToBinary, padMessage, parseBlocks, createMessageSchedule, toHex } from '@/lib/sha256';

export default function Step3Schedule({ message, onComplete, onBack }) {
  const { bytes } = messageToBinary(message);
  const { padded } = padMessage(bytes);
  const blocks = parseBlocks(padded);
  const { schedule, steps } = createMessageSchedule(blocks[0]);
  
  const [revealedCount, setRevealedCount] = useState(0);
  const [showDetail, setShowDetail] = useState(null);

  const revealNext = () => {
    if (revealedCount < 48) {
      setRevealedCount(prev => Math.min(prev + 4, 48));
    }
  };

  const revealAll = () => setRevealedCount(48);

  const allRevealed = revealedCount >= 48;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold mb-2">Step 4: Message Schedule</h2>
        <p className="text-sm text-muted-foreground">
          Expand 16 words to 64 using σ₀ and σ₁ functions. Click "Reveal Next" to generate words step by step.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        {/* Original 16 words */}
        <div>
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Original Words (W₀–W₁₅)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
            {schedule.slice(0, 16).map((w, i) => (
              <div key={i} className="px-2 py-1.5 rounded bg-primary/10 text-center font-mono text-xs">
                <span className="text-muted-foreground">W{i}: </span>
                <span className="text-primary">{toHex(w)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expanded words */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Expanded Words (W₁₆–W₆₃)</h3>
            <div className="flex gap-2">
              {!allRevealed && (
                <>
                  <Button size="sm" variant="outline" onClick={revealNext} className="text-xs h-7">
                    Reveal Next 4
                  </Button>
                  <Button size="sm" variant="outline" onClick={revealAll} className="text-xs h-7">
                    Reveal All
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
            {steps.slice(0, revealedCount).map((step, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setShowDetail(showDetail === i ? null : i)}
                className={`px-2 py-1.5 rounded text-center font-mono text-xs transition-all ${
                  showDetail === i ? 'bg-accent/20 border border-accent/30' : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                <span className="text-muted-foreground">W{step.t}: </span>
                <span className="text-foreground">{toHex(step.result)}</span>
              </motion.button>
            ))}
          </div>

          {!allRevealed && (
            <p className="text-xs text-muted-foreground mt-2">
              {48 - revealedCount} words remaining — click "Reveal Next 4" to continue
            </p>
          )}
        </div>

        {/* Detail view */}
        {showDetail !== null && steps[showDetail] && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-secondary/50 border border-border space-y-2"
          >
            <h4 className="text-xs font-semibold text-accent">
              W{steps[showDetail].t} Computation Detail
            </h4>
            <div className="font-mono text-xs space-y-1 text-muted-foreground">
              <p>σ₁(W{steps[showDetail].t - 2}) = <span className="text-foreground">{toHex(steps[showDetail].sigma1_val)}</span></p>
              <p>W{steps[showDetail].t - 7} = <span className="text-foreground">{toHex(steps[showDetail].wt_minus_7)}</span></p>
              <p>σ₀(W{steps[showDetail].t - 15}) = <span className="text-foreground">{toHex(steps[showDetail].sigma0_val)}</span></p>
              <p>W{steps[showDetail].t - 16} = <span className="text-foreground">{toHex(steps[showDetail].wt_minus_16)}</span></p>
              <div className="border-t border-border pt-1 mt-1">
                <p>Result = σ₁ + W{steps[showDetail].t-7} + σ₀ + W{steps[showDetail].t-16}</p>
                <p className="text-primary font-semibold">W{steps[showDetail].t} = {toHex(steps[showDetail].result)}</p>
              </div>
            </div>
          </motion.div>
        )}

        <p className="text-xs text-muted-foreground italic">
          Formula: Wₜ = σ₁(Wₜ₋₂) + Wₜ₋₇ + σ₀(Wₜ₋₁₅) + Wₜ₋₁₆ — click any expanded word to see the computation.
        </p>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onComplete} disabled={!allRevealed} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          {allRevealed ? 'Continue to Compression' : 'Reveal all words first'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
