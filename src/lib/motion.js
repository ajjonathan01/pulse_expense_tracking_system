/**
 * PULSE Motion Tokens and Framer Motion Variants
 * Specifications per SRS Section 5 (MOT-01 through MOT-16)
 */

export const transitions = {
  default: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
  fast: { duration: 0.15, ease: 'easeOut' },
  medium: { duration: 0.25, ease: 'easeOut' },
  counter: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  progress: { duration: 0.45, ease: 'easeOut' },
};

// MOT-01: Dashboard entrance & stagger
export const dashboardVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04, // 40ms stagger
    },
  },
};

export const dashboardItemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: 'easeOut' },
  },
};

// MOT-03: Card hover (elevation 0 -> subtle shadow, y-2px, 120-180ms ease-out)
export const cardHoverProps = {
  whileHover: {
    y: -2,
    transition: { duration: 0.15, ease: 'easeOut' },
  },
};

// MOT-07: Page transition
export const pageTransitionVariants = {
  initial: { opacity: 0, x: 8 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, transition: { duration: 0.18, ease: 'easeIn' } },
};

// MOT-08: Modal open/close (opacity 0, scale 0.96 -> 1, 200-250ms)
export const modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

export const modalDialogVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 6,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
};

// MOT-10: Row deletion (opacity 1, height full -> opacity 0, height 0, 200ms ease-in)
export const tableRowVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: {
    opacity: 0,
    height: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
    overflow: 'hidden',
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

// MOT-11: Toast
export const toastVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, y: 8, transition: { duration: 0.15, ease: 'easeIn' } },
};

// MOT-13: Dropdown
export const dropdownVariants = {
  closed: { opacity: 0, y: -4, pointerEvents: 'none', transition: { duration: 0.15 } },
  open: { opacity: 1, y: 0, pointerEvents: 'auto', transition: { duration: 0.18, ease: 'easeOut' } },
};
