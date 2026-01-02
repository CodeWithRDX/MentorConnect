import { motion } from 'framer-motion';

const Loader = ({ isLoading }) => {
    if (!isLoading) return null;

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm flex items-center justify-center"
        >
            <div className="relative flex items-center justify-center">
                {/* Outer Ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 rounded-full border-b-2 border-primary/20"
                />

                {/* Middle Ring */}
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute w-24 h-24 rounded-full border-t-2 border-primary/40"
                />

                {/* Inner Ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute w-16 h-16 rounded-full border-r-2 border-primary"
                />

                {/* Center Dot */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute w-4 h-4 rounded-full bg-primary blur-[2px]"
                />

                {/* Loading Text */}
                <div className="absolute -bottom-16 text-primary font-medium tracking-[0.2em] text-sm animate-pulse">
                    LOADING
                </div>
            </div>
        </motion.div>
    );
};

export default Loader;
