import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, RotateCcw, Zap } from 'lucide-react';
import { sha256Quick } from '@/lib/sha256';

export default function Compare() {
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [hash1, setHash1] = useState('');
  const [hash2, setHash2] = useState('');
  const [computed, setComputed] = useState(false);

  const compute = () => {
    if (!input1 || !input2) return;
    setHash1(sha256Quick(input1));
    setHash2(sha256Quick(input2));
    setComputed(true);
  };

  const reset = () => {
    setInput1('');
    setInput2('');
    setHash1('');
    setHash2('');
    setComputed(false);
  };

  const loadAvalancheDemo = () => {
    setInput1('hello');
    setInput2('hellp');
    setHash1(sha256Quick('hello'));
    setHash2(sha256Quick('hellp'));
    setComputed(true);
  };

  // Count differing characters
  const diffCount = hash1 && hash2
    ? hash1.split('').filter((c, i) => c !== hash2[i]).length
    : 0;

  const diffPercent = hash1 && hash2
    ? ((diffCount / 64) * 100).toFixed(1)
    : 0;

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-black mb-2">Hash Comparison</h1>
        <p className="text-muted-foreground text-sm">
          Compare SHA-256 hashes of two inputs. See the avalanche effect — how a tiny change produces a completely different hash.
        </p>
      </motion.div>

      {/* Inputs */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Message A</label>
          <Input
            value={input1}
            onChange={(e) => { setInput1(e.target.value); setComputed(false); }}
            placeholder='e.g. "hello"'
            className="bg-secondary border-border font-mono"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Message B</label>
          <Input
            value={input2}
            onChange={(e) => { setInput2(e.target.value); setComputed(false); }}
            placeholder='e.g. "hellp"'
            className="bg-secondary border-border font-mono"
          />
        </div>
      </div>

      <div className="flex gap-3 mb-8">
        <Button onClick={compute} disabled={!input1 || !input2} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <ArrowRight className="w-4 h-4" /> Compute Hashes
        </Button>
        <Button variant="outline" onClick={loadAvalancheDemo} className="gap-2">
          <Zap className="w-4 h-4" /> Avalanche Demo
        </Button>
        <Button variant="outline" onClick={reset} className="gap-2">
          <RotateCcw className="w-4 h-4" /> Reset
        </Button>
      </div>

      {/* Results */}
      {computed && hash1 && hash2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Hash A */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">A</span>
              <span className="text-sm font-medium">SHA-256("{input1}")</span>
            </div>
            <div className="font-mono text-sm flex flex-wrap">
              {hash1.split('').map((c, i) => (
                <span key={i} className={`${c !== hash2[i] ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Hash B */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center">B</span>
              <span className="text-sm font-medium">SHA-256("{input2}")</span>
            </div>
            <div className="font-mono text-sm flex flex-wrap">
              {hash2.split('').map((c, i) => (
                <span key={i} className={`${c !== hash1[i] ? 'text-accent font-bold' : 'text-muted-foreground'}`}>
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Diff analysis */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-sm font-semibold">Difference Analysis</h3>
            
            {input1 === input2 ? (
              <p className="text-sm text-primary font-medium">Inputs are identical — hashes match perfectly!</p>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-lg bg-secondary">
                    <p className="text-2xl font-bold text-foreground">{diffCount}</p>
                    <p className="text-xs text-muted-foreground">Characters differ</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary">
                    <p className="text-2xl font-bold text-foreground">{diffPercent}%</p>
                    <p className="text-xs text-muted-foreground">Difference rate</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary">
                    <p className="text-2xl font-bold text-foreground">64</p>
                    <p className="text-xs text-muted-foreground">Total hex chars</p>
                  </div>
                </div>

                {/* Visual diff bar */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Character-by-character comparison:</p>
                  <div className="flex gap-px">
                    {hash1.split('').map((c, i) => (
                      <div
                        key={i}
                        className={`h-6 flex-1 rounded-sm transition-colors ${
                          c !== hash2[i] ? 'bg-destructive/60' : 'bg-primary/20'
                        }`}
                        title={`Position ${i}: ${c} vs ${hash2[i]}`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1 text-[10px] text-muted-foreground font-mono">
                    <span>0</span>
                    <span>16</span>
                    <span>32</span>
                    <span>48</span>
                    <span>63</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground italic">
                  {parseFloat(diffPercent) > 40
                    ? '✨ The avalanche effect: even a tiny input change causes ~50% of output bits to flip — this is by design!'
                    : 'The difference shows how SHA-256 transforms input variations into output changes.'}
                </p>
              </>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
