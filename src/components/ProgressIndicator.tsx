import { motion } from "framer-motion";

interface ProgressIndicatorProps {
  step: number;
  totalSteps: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  step,
  totalSteps,
}) => {
  const progressPercentage = (step / totalSteps) * 100;

  const stepMessages = [
    "🔹 Getting signed URL...",
    "🔹 Uploading to the Server...",
    "🔹 Processing video...",
    "✅ Upload complete!",
  ];

  return (
    <div className="mt-4">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <motion.div
          className="bg-blue-500 h-2.5 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      {/* Step Message Animation */}
      <motion.p
        className="mt-2 text-sm text-gray-600"
        key={step}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {stepMessages[step - 1]}
      </motion.p>
    </div>
  );
};

export default ProgressIndicator;
