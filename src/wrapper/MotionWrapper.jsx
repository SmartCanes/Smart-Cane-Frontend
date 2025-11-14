import { motion, useInView } from "framer-motion";
import React from "react";

export const FadeIn = ({ children, delay = 0, duration = 0.6 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    transition={{ duration, delay }}
    viewport={{ amount: 0.2 }}
  >
    {children}
  </motion.div>
);

export const SlideUp = ({ children, delay = 0, duration = 0.6 }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration, delay }}
    viewport={{ amount: 0.2 }}
  >
    {children}
  </motion.div>
);

export const ScaleIn = ({ children, delay = 0, duration = 0.6 }) => (
  <motion.div
    initial={{ opacity: 0.0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration, delay }}
    viewport={{ amount: 0.2 }}
  >
    {children}
  </motion.div>
);

export const SlideInFromLeft = ({ children, delay = 0, duration = 0.6 }) => (
  <motion.div
    initial={{ opacity: 0, x: -40 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration, delay }}
    viewport={{ amount: 0.2 }}
  >
    {children}
  </motion.div>
);

export const SlideInFromRight = ({
  children,
  delay = 0,
  duration = 0.6,
  className
}) => (
  <motion.div
    initial={{ opacity: 0, x: 40 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration, delay }}
    viewport={{ amount: 0.2 }}
    className={className}
  >
    {children}
  </motion.div>
);

export const TextReveal = ({ children, delay = 0, duration = 0.6 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration, delay }}
    viewport={{ amount: 0.2 }}
    style={{ overflow: "hidden", display: "inline-block" }}
  >
    {children}
  </motion.div>
);
export function TextFade({
  delay,
  direction,
  children,
  className = "",
  staggerChildren = 0.1
}) {
  const FADE_DOWN = {
    show: { opacity: 1, y: 0, transition: { type: "spring" } },
    hidden: { opacity: 0, y: direction === "down" ? -18 : 18 }
  };
  const ref = React.useRef(null);
  const isInView = useInView(ref, { amount: 0.2 });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "show" : ""}
      viewport={{ amount: 0.2 }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: staggerChildren,
            delayChildren: delay
          }
        }
      }}
      className={className}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child) ? (
          <motion.div variants={FADE_DOWN}>{child}</motion.div>
        ) : (
          child
        )
      )}
    </motion.div>
  );
}

export function WordsPullUp({ text, delay, className }) {
  const splittedText = text.split(" ");

  const pullupVariant = {
    initial: { y: 20, opacity: 0 },
    animate: (i) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1 + delay
      }
    })
  };

  const ref = React.useRef(null);
  const isInView = useInView(ref, { amount: 0.2 });
  return (
    <div className="flex justify-center">
      {splittedText.map((current, i) => (
        <motion.div
          key={i}
          ref={ref}
          variants={pullupVariant}
          initial="initial"
          animate={isInView ? "animate" : ""}
          custom={i}
          className={"tracking-tighter pr-2" + className}
        >
          {current == "" ? <span>&nbsp;</span> : current}
        </motion.div>
      ))}
    </div>
  );
}

export const HoverIcon = ({
  src,
  alt,
  size = 40,
  hoverScale = 1.2,
  hoverRotate = 10,
  className = "",
  transition = { type: "spring", stiffness: 300 }
}) => {
  return (
    <motion.img
      src={src}
      alt={alt}
      className={`${className} w-[${size}px] h-[${size}px]`}
      initial={{
        scale: 1,
        rotate: 0
      }}
      whileHover={{
        scale: hoverScale,
        rotate: hoverRotate
      }}
      transition={transition}
    />
  );
};

export const BlinkIcon = ({
  src,
  alt,
  size = 40,
  className = "",
  transition = { type: "spring", stiffness: 300, damping: 12 }
}) => {
  return (
    <motion.img
      src={src}
      alt={alt}
      className={`${className} w-[${size}px] h-[${size}px] object-contain`}
      initial={{ scaleX: 1, scaleY: 1 }}
      whileHover={{
        scaleY: 0.3,
        scaleX: 1.2
      }}
      transition={transition}
    />
  );
};

export const BlinkingIcon = ({
  src,
  alt,
  size = 40,
  className = "",
  blinkDuration = 0.3,
  pauseDuration = 4
}) => {
  return (
    <motion.img
      src={src}
      alt={alt}
      className={`${className} w-[${size}px] h-[${size}px] object-contain`}
      animate={{
        scaleY: [1, 0.2, 1],
        scaleX: [1, 1.1, 1]
      }}
      transition={{
        duration: blinkDuration,
        times: [0, 0.5, 1],
        repeat: Infinity,
        repeatDelay: pauseDuration,
        ease: "easeInOut"
      }}
    />
  );
};

export const HoverNavEffect = ({
  children,
  className = "",
  distance = 5,
  direction = "up"
}) => {
  const motionProps = {};
  if (direction === "right") motionProps.x = distance;
  else if (direction === "left") motionProps.x = -distance;
  else if (direction === "up") motionProps.y = -distance;
  else if (direction === "down") motionProps.y = distance;

  return (
    <motion.div
      initial={{ x: 0, y: 0 }}
      whileHover={motionProps}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      className={`inline-block cursor-pointer ${className}`}
    >
      {children}
    </motion.div>
  );
};
