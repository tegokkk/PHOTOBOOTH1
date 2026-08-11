"use client";

import { useAppStore } from "@/store/useAppStore";
import { FrameSelectionScreen } from "@/components/booth/FrameSelectionScreen";
import { CameraScreen } from "@/components/booth/CameraScreen";
import { PhotoPreviewScreen } from "@/components/booth/PhotoPreviewScreen";
import { LandingScreen } from "@/components/booth/LandingScreen";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  const { currentStep } = useAppStore();

  const renderStep = () => {
    switch (currentStep) {
      case "landing":
        return <LandingScreen />;
      case "frame-selection":
        return <FrameSelectionScreen />;
      case "camera":
        return <CameraScreen />;
      case "preview":
        return <PhotoPreviewScreen />;
      default:
        return <LandingScreen />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="w-full flex-grow flex flex-col"
      >
        {renderStep()}
      </motion.div>
    </AnimatePresence>
  );
}
