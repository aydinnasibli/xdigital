"use client";

import { motion, useScroll } from "framer-motion";

const HorizontalScrollBar = () => {
    const { scrollYProgress } = useScroll();

    return (
        <motion.div
            className="fixed top-0 left-0 h-1 bg-gray-200/80 z-50 "
            style={{
                width: "100%",
                scaleX: scrollYProgress, // Expands the line as you scroll
                transformOrigin: "left",
            }}
        />
    );
};

export default HorizontalScrollBar;