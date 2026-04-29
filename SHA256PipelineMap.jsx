import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Type, AlignJustify, Grid3x3, LayoutList, Cpu, Hash } from 'lucide-react';

const steps = [
  {
    id: 0,
    label: 'Input',
    sublabel: 'Any message',
    icon: Type,
    color: 'text-chart-3',
    bg: 'bg-chart-3/10',
    border: 'border-chart-3/30',
    glow: 'shadow-chart-3/20',
    description: 'Any string is accepted. SHA-256 converts it to UTF-8 bytes as the starting point.',
    detail: '"hello" → 68 65 6c 6c 6f',
    navTarget: '/interactive',
    navStep: 0,
  },
  {
    id: 1,
    label: 'Padding',
    sublabel: '→ 512-bit blocks',
    icon: AlignJustify,
    color: 'text-chart-4',
    bg: 'bg-chart-4/10',
    border: 'border-chart-4/30',
    glow: 'shadow-chart-4/20',
    description: 'The message is padded with a 1-bit, zeros, then the 64-bit length so the total is a multiple of 512 bits.',
    detail: 'msg ‖ 0x80 ‖ 0x00... ‖ length₆₄',
    navTarget: '/interactive',
    navStep: 1,
  },
  {
    id: 2,
    label: 'Parse Blocks',
    sublabel: '16 × 32-bit words',
    icon: Grid3x3,
    color: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-accent/30',
    glow: 'shadow-accent/20',
    description: 'The padded message is split into 512-bit blocks. Each block becomes 16 32-bit words W₀–W₁₅.',
    detail: '512 bits → W₀ … W₁₅',
    navTarget: '/interactive',
    navStep: 2,
  },
  {
    id: 3,
    label: 'Msg Schedule',
    sublabel: '64 words expanded',
    icon: LayoutList,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    glow: 'shadow-primary/20',
    description: 'The 16 words are expanded to 64 using σ₀ and σ₁ rotation functions, creating unique values for each compression round.',
    detail: 'Wₜ = σ₁(Wₜ₋₂) + Wₜ₋₇ + σ₀(Wₜ₋₁₅) + Wₜ₋₁₆',
    navTarget: '/interactive',
    navStep: 3,
  },
  {
    id: 4,
    label: 'Compression',
    sublabel: '64 rounds',
    icon: Cpu,
    color: 'text-chart-2',
    bg: 'bg-chart-2/10',
    border: 'border-chart-2/30',
    glow: 'shadow-chart-2/20',
    description: '64 rounds transform 8 working variables (a–h) using Ch, Maj, Σ₀, Σ₁ and round constants K₀–K₆₃.',
    detail: 'T₁ = h + Σ₁(e) + Ch + Kₜ + Wₜ',
    navTarget: '/interactive',
    navStep: 4,
  },
  {
    id: 5,
    label: 'Final Hash',
    sublabel: '256-bit digest',
    icon: Hash,
    color: 'text-chart-5',
    bg: 'bg-chart-5/10',
    border: 'border-chart-5/30',
    glow: 'shadow-chart-5/20',
    description: 'The working variables are added back to the initial hash values. The result is the 256-bit (64 hex char) SHA-256 digest.',
    detail: 'H₀‖H₁‖H₂‖H₃‖H₄‖H₅‖H₆‖H₇',
    navTarget: '/interactive',
    navStep: 5,
  },
];

export default function SHA256PipelineMap() {
  const [activeStep, setActiveStep] = useState(null);
  const navigate = useNavigate();

  const handleClick = (step) => {
    // Navigate to interactive page; pass the step via state
    navigate(step.navTarget, { state: { startStep: step.navStep } });
  };

  return (
    <section>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">SHA-256 Pipeline</h2>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Click any stage to jump straight into that step of the interactive hasher.
        </p>
      </div>

      {/* Pipeline flow — horizontal scroll on mobile */}
      <div className="overflow-x-auto pb-4">
        <div className="flex items-stretch gap-0 min-w-max mx-auto w-fit">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;
            return (
              <div key={step.id} className="flex items-center">
                <motion.button
                  onClick={() => handleClick(step)}
                  onHoverStart={() => setActiveStep(step.id)}
                  onHoverEnd={() => setActiveStep(null)}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative flex flex-col items-center gap-2 px-5 py-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 w-36 ${
                    isActive
                      ? `${step.border} ${step.bg} shadow-lg ${step.glow}`
                      : 'border-border bg-card hover:border-border/80'
                  }`}
                >
                  {/* Step number */}
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    isActive ? `${step.border} ${step.bg} ${step.color}` : 'border-border bg-background text-muted-foreground'
                  }`}>
                    {i + 1}
                  </span>

                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${step.bg}`}>
                    <Icon className={`w-5 h-5 ${step.color}`} />
                  </div>

                  <div className="text-center">
                    <p className={`text-sm font-bold leading-tight ${isActive ? step.color : 'text-foreground'}`}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{step.sublabel}</p>
                  </div>
                </motion.button>

                {/* Connector arrow */}
                {i < steps.length - 1 && (
                  <div className="flex items-center px-1">
                    <ArrowRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      <div className="mt-4 min-h-[96px]">
        <AnimatePresence mode="wait">
          {activeStep !== null && (
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.18 }}
              className={`rounded-xl border ${steps[activeStep].border} ${steps[activeStep].bg} p-5 flex flex-col sm:flex-row sm:items-center gap-4`}
            >
              <div className="flex-1">
                <p className={`text-sm font-semibold mb-1 ${steps[activeStep].color}`}>
                  Step {activeStep + 1}: {steps[activeStep].label}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {steps[activeStep].description}
                </p>
              </div>
              <div className={`shrink-0 px-4 py-2 rounded-lg font-mono text-xs ${steps[activeStep].bg} ${steps[activeStep].color} border ${steps[activeStep].border} whitespace-nowrap`}>
                {steps[activeStep].detail}
              </div>
            </motion.div>
          )}
          {activeStep === null && (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-24 rounded-xl border border-dashed border-border"
            >
              <p className="text-xs text-muted-foreground">Hover a step to see details · Click to explore interactively</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
