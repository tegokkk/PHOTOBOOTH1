"use client";

import { PageTransition } from "@/components/ui/PageTransition";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // template.tsx re-renders on route change but doesn't unmount AnimatePresence if wrapped correctly
  // Wait, AnimatePresence needs to be outside the changing element. 
  // In Next.js App Router, `template.tsx` creates a new instance on every navigation.
  // So wrapping children here directly will trigger the enter animation perfectly.
  // However, exit animations in App Router are famously tricky without a higher level AnimatePresence.
  // But for simple page transitions, just using a motion.div on enter is often enough and very smooth.
  return (
    <AnimatePresence mode="wait">
      <PageTransition key={pathname}>
        {children}
      </PageTransition>
    </AnimatePresence>
  );
}
