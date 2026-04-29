import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, Type } from 'lucide-react';

export default function Step0Input({ onComplete, initialValue }) {
  const [message, setMessage] = useState(initialValue || '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold mb-2">Step 1: Enter Your Message</h2>
        <p className="text-sm text-muted-foreground">
          Type a message to hash. SHA-256 accepts any input and produces a fixed 256-bit digest.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Type className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium">Message Input</span>
        </div>
        
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here... (e.g., hello)"
          className="bg-secondary border-border font-mono"
          autoFocus
        />

        {message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3"
          >
            <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
              <p className="text-xs text-muted-foreground">Characters: <span className="text-foreground font-mono">{message.length}</span></p>
              <p className="text-xs text-muted-foreground">Bytes (UTF-8): <span className="text-foreground font-mono">{new TextEncoder().encode(message).length}</span></p>
              <p className="text-xs text-muted-foreground">Bits: <span className="text-foreground font-mono">{new TextEncoder().encode(message).length * 8}</span></p>
            </div>

            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-2">UTF-8 Bytes:</p>
              <div className="flex flex-wrap gap-1">
                {Array.from(new TextEncoder().encode(message)).map((byte, i) => (
                  <span key={i} className="px-2 py-1 rounded bg-primary/10 text-primary font-mono text-xs border border-primary/20">
                    0x{byte.toString(16).padStart(2, '0')}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => onComplete(message)}
          disabled={!message}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        >
          Continue to Padding <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
