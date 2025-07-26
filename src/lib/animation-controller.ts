/**
 * Animation Controller for smooth element shifting animations
 * Provides GPU-accelerated transforms, staggered animations, and cancellation support
 */

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  stagger?: number;
}

export interface ElementShiftAnimation {
  elementId: string;
  direction: "up" | "down";
  distance: number;
  config?: Partial<AnimationConfig>;
}

export interface AnimationState {
  elementId: string;
  type: "shift" | "indicator" | "highlight";
  status: "pending" | "running" | "completed" | "cancelled";
  startTime: number;
  duration: number;
  easing: string;
  transform: string;
  animationId?: NodeJS.Timeout;
}

export interface PerformanceMetrics {
  activeAnimations: number;
  frameRate: number;
  lastFrameTime: number;
  droppedFrames: number;
}

export class AnimationController {
  private activeAnimations = new Map<string, AnimationState>();
  private animationQueue: ElementShiftAnimation[] = [];
  private isProcessingQueue = false;
  private performanceMetrics: PerformanceMetrics = {
    activeAnimations: 0,
    frameRate: 60,
    lastFrameTime: 0,
    droppedFrames: 0,
  };

  // Default animation configurations
  private readonly defaultConfigs = {
    shift: {
      duration: 300,
      easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      stagger: 50,
    },
    indicator: {
      duration: 200,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    highlight: {
      duration: 150,
      easing: "ease-out",
    },
  };

  /**
   * Animate a single element shift with GPU acceleration
   */
  async animateElementShift(
    elementId: string,
    direction: "up" | "down",
    distance: number,
    config?: Partial<AnimationConfig>
  ): Promise<void> {
    const element =
      document.getElementById(elementId) ||
      (document.querySelector(
        `[data-element-id="${elementId}"]`
      ) as HTMLElement);

    if (!element) {
      console.warn(`Element with id ${elementId} not found for animation`);
      return;
    }

    // Cancel any existing animation for this element
    this.cancelAnimation(elementId);

    const animationConfig = {
      ...this.defaultConfigs.shift,
      ...config,
    };

    const translateY = direction === "down" ? distance : -distance;

    // Create animation state
    const animationState: AnimationState = {
      elementId,
      type: "shift",
      status: "pending",
      startTime: performance.now(),
      duration: animationConfig.duration,
      easing: animationConfig.easing,
      transform: `translate3d(0, ${translateY}px, 0)`,
    };

    this.activeAnimations.set(elementId, animationState);
    this.updatePerformanceMetrics();

    return new Promise((resolve, reject) => {
      try {
        // Apply initial transform immediately for responsiveness
        element.style.transform = animationState.transform;
        element.style.transition = `transform ${animationConfig.duration}ms ${animationConfig.easing}`;
        element.style.willChange = "transform"; // Optimize for GPU acceleration

        // Update animation state
        animationState.status = "running";
        animationState.startTime = performance.now();

        // Set up completion handler
        const handleTransitionEnd = (event: TransitionEvent) => {
          if (
            event &&
            event.target === element &&
            event.propertyName === "transform"
          ) {
            cleanup();
            resolve();
          }
        };

        // Cleanup function to avoid duplication
        const cleanup = () => {
          element.removeEventListener("transitionend", handleTransitionEnd);
          element.removeEventListener(
            "transitioncancel",
            handleTransitionCancel
          );

          // Clean up styles
          element.style.willChange = "auto";

          // Update animation state
          animationState.status = "completed";
          this.activeAnimations.delete(elementId);
          this.updatePerformanceMetrics();
        };

        const handleTransitionCancel = () => {
          element.removeEventListener("transitionend", handleTransitionEnd);
          element.removeEventListener(
            "transitioncancel",
            handleTransitionCancel
          );

          // Clean up styles
          element.style.willChange = "auto";

          // Update animation state
          animationState.status = "cancelled";
          this.activeAnimations.delete(elementId);
          this.updatePerformanceMetrics();

          reject(new Error("Animation cancelled"));
        };

        element.addEventListener("transitionend", handleTransitionEnd);
        element.addEventListener("transitioncancel", handleTransitionCancel);

        // Fallback timeout in case transition events don't fire
        const timeoutId = setTimeout(() => {
          if (this.activeAnimations.has(elementId)) {
            cleanup();
            resolve();
          }
        }, animationConfig.duration + 100);

        // Store timeout ID for cleanup
        animationState.animationId = timeoutId;
      } catch (error) {
        this.activeAnimations.delete(elementId);
        this.updatePerformanceMetrics();
        reject(error);
      }
    });
  }

  /**
   * Animate multiple elements with staggered timing
   */
  async animateStaggeredShifts(
    animations: ElementShiftAnimation[],
    baseConfig?: Partial<AnimationConfig>
  ): Promise<void> {
    if (animations.length === 0) return;

    const config = {
      ...this.defaultConfigs.shift,
      ...baseConfig,
    };

    // Sort animations by element position for consistent staggering
    const sortedAnimations = [...animations].sort((a, b) => {
      const elementA =
        document.getElementById(a.elementId) ||
        document.querySelector(`[data-element-id="${a.elementId}"]`);
      const elementB =
        document.getElementById(b.elementId) ||
        document.querySelector(`[data-element-id="${b.elementId}"]`);

      if (!elementA || !elementB) return 0;

      const rectA = elementA.getBoundingClientRect();
      const rectB = elementB.getBoundingClientRect();

      return rectA.top - rectB.top;
    });

    // Start animations with stagger delay
    const animationPromises = sortedAnimations.map((animation, index) => {
      const delay = (config.stagger || 0) * index;

      return new Promise<void>((resolve) => {
        setTimeout(async () => {
          try {
            await this.animateElementShift(
              animation.elementId,
              animation.direction,
              animation.distance,
              {
                ...config,
                ...animation.config,
              }
            );
            resolve();
          } catch (error) {
            console.warn(
              `Animation failed for element ${animation.elementId}:`,
              error
            );
            resolve(); // Don't fail the entire batch for one element
          }
        }, delay);
      });
    });

    // Wait for all animations to complete
    await Promise.all(animationPromises);
  }

  /**
   * Animate insertion indicator with smooth transitions
   */
  async animateInsertionIndicator(
    elementId: string,
    show: boolean,
    position: "top" | "bottom" = "top"
  ): Promise<void> {
    const element =
      document.getElementById(elementId) ||
      (document.querySelector(
        `[data-indicator-id="${elementId}"]`
      ) as HTMLElement);

    if (!element) {
      console.warn(`Indicator element with id ${elementId} not found`);
      return;
    }

    // Cancel any existing animation for this indicator
    this.cancelAnimation(`indicator-${elementId}`);

    const config = this.defaultConfigs.indicator;
    const animationId = `indicator-${elementId}`;

    const animationState: AnimationState = {
      elementId: animationId,
      type: "indicator",
      status: "pending",
      startTime: performance.now(),
      duration: config.duration,
      easing: config.easing,
      transform: show ? "scale(1) opacity(1)" : "scale(0.8) opacity(0)",
    };

    this.activeAnimations.set(animationId, animationState);
    this.updatePerformanceMetrics();

    return new Promise((resolve, reject) => {
      try {
        if (show) {
          // Show animation: scale from 0.8 to 1, opacity from 0 to 1
          element.style.transform = "scale(0.8)";
          element.style.opacity = "0";
          element.style.display = "block";
          element.style.transition = `all ${config.duration}ms ${config.easing}`;
          element.style.willChange = "transform, opacity";

          // Trigger animation on next frame
          requestAnimationFrame(() => {
            element.style.transform = "scale(1)";
            element.style.opacity = "1";
          });
        } else {
          // Hide animation: scale to 0.8, opacity to 0
          element.style.transition = `all ${config.duration}ms ${config.easing}`;
          element.style.willChange = "transform, opacity";
          element.style.transform = "scale(0.8)";
          element.style.opacity = "0";
        }

        animationState.status = "running";

        const handleTransitionEnd = () => {
          element.style.willChange = "auto";

          if (!show) {
            element.style.display = "none";
          }

          animationState.status = "completed";
          this.activeAnimations.delete(animationId);
          this.updatePerformanceMetrics();

          resolve();
        };

        element.addEventListener("transitionend", handleTransitionEnd, {
          once: true,
        });

        // Fallback timeout
        setTimeout(() => {
          if (this.activeAnimations.has(animationId)) {
            handleTransitionEnd();
          }
        }, config.duration + 50);
      } catch (error) {
        this.activeAnimations.delete(animationId);
        this.updatePerformanceMetrics();
        reject(error);
      }
    });
  }

  /**
   * Cancel a specific animation
   */
  cancelAnimation(elementId: string): void {
    const animationState = this.activeAnimations.get(elementId);

    if (!animationState) return;

    const element =
      document.getElementById(elementId) ||
      (document.querySelector(
        `[data-element-id="${elementId}"]`
      ) as HTMLElement) ||
      (document.querySelector(
        `[data-indicator-id="${elementId}"]`
      ) as HTMLElement);

    // Clear timeout if it exists
    if (animationState.animationId) {
      clearTimeout(animationState.animationId);
    }

    if (element) {
      // Remove transition to stop animation immediately
      element.style.transition = "none";
      element.style.willChange = "auto";

      // Reset transform to avoid stuck states
      if (animationState.type === "shift") {
        element.style.transform = "translate3d(0, 0, 0)";
      }
    }

    animationState.status = "cancelled";
    this.activeAnimations.delete(elementId);
    this.updatePerformanceMetrics();
  }

  /**
   * Cancel all active animations
   */
  cancelAllAnimations(): void {
    const elementIds = Array.from(this.activeAnimations.keys());

    elementIds.forEach((elementId) => {
      this.cancelAnimation(elementId);
    });

    // Clear the animation queue
    this.animationQueue = [];
    this.isProcessingQueue = false;
  }

  /**
   * Batch multiple animations for optimal performance
   */
  async batchAnimations(animations: ElementShiftAnimation[]): Promise<void> {
    // Add animations to queue
    this.animationQueue.push(...animations);

    // Process queue if not already processing
    if (!this.isProcessingQueue) {
      await this.processAnimationQueue();
    }
  }

  /**
   * Process the animation queue with performance optimization
   */
  private async processAnimationQueue(): Promise<void> {
    if (this.isProcessingQueue || this.animationQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      // Group animations by direction for better visual flow
      const upAnimations = this.animationQueue.filter(
        (a) => a.direction === "up"
      );
      const downAnimations = this.animationQueue.filter(
        (a) => a.direction === "down"
      );

      // Clear the queue
      this.animationQueue = [];

      // Process animations in groups for better performance
      const batchPromises: Promise<void>[] = [];

      if (upAnimations.length > 0) {
        batchPromises.push(this.animateStaggeredShifts(upAnimations));
      }

      if (downAnimations.length > 0) {
        batchPromises.push(this.animateStaggeredShifts(downAnimations));
      }

      await Promise.all(batchPromises);
    } finally {
      this.isProcessingQueue = false;

      // Process any new animations that were added during processing
      if (this.animationQueue.length > 0) {
        await this.processAnimationQueue();
      }
    }
  }

  /**
   * Get current animation state for debugging
   */
  getAnimationState(elementId: string): AnimationState | undefined {
    return this.activeAnimations.get(elementId);
  }

  /**
   * Get all active animations
   */
  getActiveAnimations(): Map<string, AnimationState> {
    return new Map(this.activeAnimations);
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(): void {
    const now = performance.now();
    const timeDiff = now - this.performanceMetrics.lastFrameTime;

    this.performanceMetrics.activeAnimations = this.activeAnimations.size;

    if (timeDiff > 0) {
      const currentFrameRate = 1000 / timeDiff;
      this.performanceMetrics.frameRate = currentFrameRate;

      // Track dropped frames (assuming 60fps target)
      if (currentFrameRate < 55) {
        this.performanceMetrics.droppedFrames++;
      }
    }

    this.performanceMetrics.lastFrameTime = now;
  }

  /**
   * Reset performance metrics
   */
  resetPerformanceMetrics(): void {
    this.performanceMetrics = {
      activeAnimations: this.activeAnimations.size,
      frameRate: 60,
      lastFrameTime: performance.now(),
      droppedFrames: 0,
    };
  }

  /**
   * Cleanup method to be called when component unmounts
   */
  cleanup(): void {
    this.cancelAllAnimations();
    this.activeAnimations.clear();
    this.animationQueue = [];
    this.isProcessingQueue = false;
  }
}

// Singleton instance for global use
export const animationController = new AnimationController();

// Hook for React components
export function useAnimationController() {
  return animationController;
}
