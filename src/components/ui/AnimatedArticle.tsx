//**** TRANSITION EASE VALUES *****/  
    // 1-  Starts accelerating early (little initial delay).  
    // 2 - Launches fast, almost instantly (strong overshoot).  
    // 3 - Begins to slow down fairly early.  
    // 4 - Finishes smoothly while keeping high speed until near the end.  


"use client";

import { useRef } from 'react';
import { motion, useInView } from "framer-motion";

type AnimatedArticleProps = {
  htmlContent: string;
};

export default function AnimatedArticle({ htmlContent }: AnimatedArticleProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0 }); // Trigger animation once when 0% of the component is in view

  return (
    <motion.article
      ref={ref}
      className="article-content"
      initial={{ opacity: 0, scale: 0.25 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </motion.article>
  );
}