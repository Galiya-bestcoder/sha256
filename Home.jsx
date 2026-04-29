import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, FlaskConical, GitCompare, ArrowRight, Shield, Lock, Hash, Binary, Cpu, Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SHA256PipelineMap from '@/components/home/SHA256PipelineMap';

const features = [
  {
    title: 'Algorithm Theory',
    description: 'Understand the mathematics and logic behind SHA-256 — from padding to compression rounds.',
    icon: BookOpen,
    path: '/theory',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
  },
  {
    title: 'Interactive Hasher',
    description: 'Hash messages step-by-step. Watch bits transform through each stage of the algorithm.',
    icon: FlaskConical,
    path: '/interactive',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    borderColor: 'border-accent/20',
  },
  {
    title: 'Hash Comparison',
    description: 'Compare hashes of different inputs. See the avalanche effect in action.',
    icon: GitCompare,
    path: '/compare',
    color: 'text-chart-3',
    bgColor: 'bg-chart-3/10',
    borderColor: 'border-chart-3/20',
  },
];

const properties = [
  { icon: Fingerprint, title: 'Deterministic', desc: 'Same input always produces the same hash' },
  { icon: Cpu, title: 'Fast Computation', desc: 'Efficient to compute for any input size' },
  { icon: Shield, title: 'Pre-image Resistant', desc: 'Infeasible to reverse the hash function' },
  { icon: Binary, title: 'Avalanche Effect', desc: 'Small input change → completely different hash' },
  { icon: Lock, title: 'Collision Resistant', desc: 'Nearly impossible to find two inputs with same hash' },
  { icon: Hash, title: 'Fixed Output', desc: 'Always produces a 256-bit (32-byte) digest' },
];

export default function Home() {
  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="relative pt-8 pb-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            CRYPTOGRAPHIC HASH FUNCTION
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6">
            <span className="text-foreground">Explore </span>
            <span className="text-primary text-glow">SHA-256</span>
            <br />
            <span className="text-muted-foreground text-3xl sm:text-4xl lg:text-5xl font-bold">Interactively</span>
          </h1>
          
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Dive deep into the Secure Hash Algorithm 256-bit. Visualize every step, 
            from message padding to compression rounds.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/theory">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2 glow-primary">
                <BookOpen className="w-4 h-4" />
                Start Learning
              </Button>
            </Link>
            <Link to="/interactive">
              <Button size="lg" variant="outline" className="border-border hover:bg-secondary font-semibold gap-2">
                <FlaskConical className="w-4 h-4" />
                Try Hashing
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Hash demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 max-w-2xl mx-auto"
        >
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-destructive" />
              <span className="w-2 h-2 rounded-full bg-chart-4" />
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="ml-2">sha256_demo</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-mono text-sm">input:</span>
                <span className="font-mono text-sm text-foreground">"hello"</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground font-mono text-sm shrink-0">hash:</span>
                <span className="font-mono text-xs text-primary break-all leading-relaxed">
                  2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Pipeline Map */}
      <SHA256PipelineMap />

      {/* Feature cards */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-3">Learn By Doing</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Three interactive modules to master SHA-256 from theory to practice.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <Link to={feature.path} className="block group">
                <div className={`rounded-2xl border ${feature.borderColor} bg-card p-8 h-full transition-all duration-300 hover:border-primary/40 hover:glow-primary`}>
                  <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-6`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">{feature.description}</p>
                  <div className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Properties */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-3">Key Properties</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            What makes SHA-256 a secure cryptographic hash function.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((prop, i) => (
            <motion.div
              key={prop.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="flex items-start gap-4 p-5 rounded-xl border border-border bg-card/50"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <prop.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">{prop.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{prop.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
