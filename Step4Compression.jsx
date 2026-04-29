import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Play, SkipForward } from 'lucide-react';
import { sha256Full, toHex, H_INITIAL } from '@/lib/sha256';

const varNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export default function Step4Compression({ message, onComplete, onBack }) {
  const result = sha256Full(message);
  const blockResult = result.blockResults[0];
  const { rounds } = blockResult;

  const [currentRound, setCurrentRound] = useState(-1); // -1 = initial state
  const [autoPlaying, setAutoPlaying] = useState(false);

  const getValues = (roundIdx) => {
    if (roundIdx < 0) return H_INITIAL;
    const r = rounds[roundIdx];
    return [r.a_out, r.b_out, r.c_out, r.d_out, r.e_out, r.f_out, r.g_out, r.h_out];
  };

  const currentValues = getValues(currentRound);
  const currentRoundData = currentRound >= 0 ? rounds[currentRound] : null;

  const stepForward = () => {
    if (currentRound < 63) setCurrentRound(prev => prev + 1);
  };

  const skipToEnd = () => {
    setCurrentRound(63);
    setAutoPlaying(false);
  };

  const autoPlay = () => {
    setAutoPlaying(true);
    let r = currentRound;
    const interval = setInterval(() => {
      r++;
      if (r > 63) {
        clearInterval(interval);
        setAutoPlaying(false);
        return;
      }
      setCurrentRound(r);
    }, 80);
  };

  const isComplete = currentRound >= 63;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold mb-2">Step 5: Compression</h2>
        <p className="text-sm text-muted-foreground">
          64 rounds transform 8 working variables. Step through each round or auto-play.
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-mono text-muted-foreground">
          Round: <span className="text-foreground font-bold">{currentRound < 0 ? 'Init' : currentRound}</span> / 63
        </span>
        <div className="flex gap-2 ml-auto">
          <Button size="sm" variant="outline" onClick={stepForward} disabled={isComplete || autoPlaying} className="gap-1 text-xs h-8">
            <ArrowRight className="w-3 h-3" /> Step
          </Button>
          <Button size="sm" variant="outline" onClick={autoPlay} disabled={isComplete || autoPlaying} className="gap-1 text-xs h-8">
            <Play className="w-3 h-3" /> Auto
          </Button>
          <Button size="sm" variant="outline" onClick={skipToEnd} disabled={isComplete} className="gap-1 text-xs h-8">
            <SkipForward className="w-3 h-3" /> Skip
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          animate={{ width: `${((currentRound + 1) / 64) * 100}%` }}
          transition={{ duration: 0.15 }}
        />
      </div>

      {/* Working variables */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-sm font-semibold">Working Variables</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {currentValues.map((val, i) => (
            <motion.div
              key={`${varNames[i]}-${currentRound}`}
              initial={{ scale: 1.05, backgroundColor: 'hsl(170 80% 50% / 0.15)' }}
              animate={{ scale: 1, backgroundColor: 'hsl(220 15% 12% / 1)' }}
              transition={{ duration: 0.3 }}
              className="p-3 rounded-lg text-center"
            >
              <span className="text-xs text-muted-foreground font-mono block mb-1">{varNames[i]}</span>
              <span className="font-mono text-sm text-foreground">{toHex(val)}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Round detail */}
      {currentRoundData && (
        <motion.div
          key={currentRound}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-border bg-card p-6 space-y-3"
        >
          <h3 className="text-sm font-semibold">Round {currentRound} Detail</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-xs">
            <div className="text-muted-foreground">Kₜ = <span className="text-chart-4">{toHex(currentRoundData.Kt)}</span></div>
            <div className="text-muted-foreground">Wₜ = <span className="text-chart-3">{toHex(currentRoundData.Wt)}</span></div>
            <div className="text-muted-foreground">Ch(e,f,g) = <span className="text-foreground">{toHex(currentRoundData.ch)}</span></div>
            <div className="text-muted-foreground">Maj(a,b,c) = <span className="text-foreground">{toHex(currentRoundData.maj)}</span></div>
            <div className="text-muted-foreground">Σ₁(e) = <span className="text-foreground">{toHex(currentRoundData.sig1)}</span></div>
            <div className="text-muted-foreground">Σ₀(a) = <span className="text-foreground">{toHex(currentRoundData.sig0)}</span></div>
            <div className="text-muted-foreground">T₁ = <span className="text-accent">{toHex(currentRoundData.T1)}</span></div>
            <div className="text-muted-foreground">T₂ = <span className="text-accent">{toHex(currentRoundData.T2)}</span></div>
          </div>
        </motion.div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onComplete} disabled={!isComplete} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          {isComplete ? 'See Final Hash' : 'Complete all 64 rounds first'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
