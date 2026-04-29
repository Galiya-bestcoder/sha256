import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Check, X } from 'lucide-react';
import { messageToBinary, padMessage } from '@/lib/sha256';

export default function Step1Padding({ message, onComplete, onBack }) {
  const [phase, setPhase] = useState(0); // 0: show binary, 1: quiz append bit, 2: show padded, 3: show length
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizCorrect, setQuizCorrect] = useState(null);

  const { bytes, bits } = messageToBinary(message);
  const { padded, msgLenBits } = padMessage(bytes);

  const handleQuiz = (answer) => {
    setQuizAnswer(answer);
    setQuizCorrect(answer === '1');
    if (answer === '1') {
      setTimeout(() => setPhase(2), 800);
    }
  };

  const paddedHex = padded.map(b => b.toString(16).padStart(2, '0'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold mb-2">Step 2: Message Padding</h2>
        <p className="text-sm text-muted-foreground">
          The message must be padded so its length is a multiple of 512 bits.
        </p>
      </div>

      {/* Phase 0: Binary representation */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-sm font-semibold">Binary Representation</h3>
        <p className="text-xs text-muted-foreground">
          Each character is encoded as 8 bits (UTF-8).
        </p>
        <div className="space-y-2">
          {bits.map((b, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-10 text-right font-mono">
                '{String.fromCharCode(bytes[i])}'
              </span>
              <span className="font-mono text-sm text-primary tracking-wider">{b}</span>
              <span className="text-xs text-muted-foreground font-mono">
                (0x{bytes[i].toString(16).padStart(2, '0')})
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Total: <span className="text-foreground font-mono">{msgLenBits} bits</span></p>
        {phase === 0 && (
          <Button size="sm" onClick={() => setPhase(1)} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            Next: Append Bit <ArrowRight className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Phase 1: Quiz */}
      {phase >= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-accent/30 bg-accent/5 p-6 space-y-4"
        >
          <h3 className="text-sm font-semibold text-accent">Interactive Question</h3>
          <p className="text-sm text-foreground">
            After the message bits, what single bit is appended first?
          </p>
          <div className="flex gap-3">
            {['0', '1'].map(opt => (
              <button
                key={opt}
                onClick={() => !quizAnswer && handleQuiz(opt)}
                disabled={!!quizAnswer}
                className={`w-16 h-16 rounded-xl border-2 font-mono text-2xl font-bold transition-all ${
                  quizAnswer === opt
                    ? opt === '1'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-destructive bg-destructive/10 text-destructive'
                    : 'border-border hover:border-accent bg-secondary'
                }`}
              >
                {opt}
                {quizAnswer === opt && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-1">
                    {opt === '1' ? <Check className="w-4 h-4 mx-auto text-primary" /> : <X className="w-4 h-4 mx-auto text-destructive" />}
                  </motion.div>
                )}
              </button>
            ))}
          </div>
          {quizCorrect === false && (
            <p className="text-xs text-destructive">Not quite — a '1' bit is always appended first. Try again!</p>
          )}
          {quizCorrect === true && (
            <p className="text-xs text-primary">Correct! A '1' bit (0x80 byte) is appended to mark the end of the message.</p>
          )}
        </motion.div>
      )}

      {/* Phase 2: Padded view */}
      {phase >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-6 space-y-4"
        >
          <h3 className="text-sm font-semibold">Padded Message ({padded.length} bytes = {padded.length * 8} bits)</h3>
          <p className="text-xs text-muted-foreground">
            Zeros are added until length ≡ 448 mod 512, then the 64-bit message length is appended.
          </p>
          <div className="grid grid-cols-8 sm:grid-cols-16 gap-0.5 font-mono text-xs">
            {paddedHex.map((hex, i) => {
              let color = 'bg-secondary text-muted-foreground'; // zero padding
              if (i < bytes.length) color = 'bg-primary/15 text-primary'; // original message
              else if (i === bytes.length) color = 'bg-accent/20 text-accent'; // 0x80 marker
              else if (i >= padded.length - 8) color = 'bg-chart-4/15 text-chart-4'; // length field
              
              return (
                <div key={i} className={`px-1 py-1.5 rounded text-center ${color}`} title={`Byte ${i}`}>
                  {hex}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary/15 border border-primary/30" /> Message</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-accent/20 border border-accent/30" /> 0x80 marker</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-secondary border border-border" /> Zero padding</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-chart-4/15 border border-chart-4/30" /> Length ({msgLenBits} bits)</span>
          </div>
          {phase === 2 && (
            <Button size="sm" onClick={() => { setPhase(3); onComplete(); }} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              Continue to Parsing <ArrowRight className="w-3 h-3" />
            </Button>
          )}
        </motion.div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </div>
    </motion.div>
  );
}
