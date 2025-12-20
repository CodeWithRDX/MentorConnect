import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_LOADER_URL =
  import.meta.env.VITE_SPLINE_LOADER_URL ||
  import.meta.env.VITE_SPLINE_SCENE_URL ||
  'https://prod.spline.design/7NZHW3H-6jQEOxOn/scene.splinecode';

const SplineLoader = ({ isOpen }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
          aria-busy="true"
          aria-live="polite"
        >
          <div className="relative w-full h-full">
            <spline-viewer
              url={DEFAULT_LOADER_URL}
              className="w-full h-full"
              style={{ width: '100%', height: '100%' }}
            />
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/80 text-sm tracking-wide">
              Loading...
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplineLoader;


