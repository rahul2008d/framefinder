import { motion } from "framer-motion";

export default function ProgressIndicator({ step, totalSteps }: { step: number; totalSteps: number }) {
  const steps = [
    "Getting signed URL…",
    "Uploading to S3…",
    "Processing video…",
    "Done!",
  ];
  const pct = Math.min(100, Math.max(0, (step / totalSteps) * 100));

  return (
    <div className="mb-3">
      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-sky-400 to-cyan-300"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.35 }}
        />
      </div>
      <motion.p
        key={step}
        initial={{ opacity: 0, y: 2 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 text-xs text-slate-300"
      >
        {steps[Math.max(0, Math.min(steps.length - 1, step - 1))]}
      </motion.p>
    </div>
  );
}
