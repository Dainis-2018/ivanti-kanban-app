// src/utils/passiveEventFix.js - Global fix for passive event listeners
// This fixes the "[Violation] Added non-passive event listener to a scroll-blocking 'touchmove' event" warning

/**
 * Applies passive event listener optimization globally
 * This improves scroll performance by making touch events passive by default
 * when they don't need to prevent default behavior
 */
export function optimizeEventListeners() {
  // Store original addEventListener method
  const originalAddEventListener = EventTarget.prototype.addEventListener

  // Override addEventListener to add passive option for touch/scroll events
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    // Normalize options parameter
    if (typeof options === 'boolean') {
      options = { capture: options }
    }
    if (!options) {
      options = {}
    }
    
    // List of events that should be passive by default for better performance
    const passiveEventTypes = [
      'touchstart',
      'touchmove', 
      'touchend',
      'touchcancel',
      'wheel',
      'mousewheel',
      'scroll'
    ]
    
    // Make these events passive by default unless explicitly set to false
    if (passiveEventTypes.includes(type) && options.passive === undefined) {
      options.passive = true
    }
    
    // Call original addEventListener with optimized options
    return originalAddEventListener.call(this, type, listener, options)
  }
}

/**
 * CSS-based touch optimization
 * These styles can be applied globally to improve touch performance
 */
export const touchOptimizationCSS = `
  /* Global touch optimization */
  * {
    -webkit-tap-highlight-color: transparent;
  }
  
  /* Optimize scrollable containers */
  .scrollable,
  .e-content,
  .e-gantt,
  .kanban-container {
    -webkit-overflow-scrolling: touch;
    transform: translateZ(0);
    will-change: scroll-position;
    touch-action: pan-x pan-y;
    overscroll-behavior: contain;
  }
  
  /* Syncfusion specific optimizations */
  .e-gantt .e-timeline-header-container,
  .e-gantt .e-chart-rows,
  .e-gantt .e-chart-scroll-container,
  .e-kanban .e-kanban-content,
  .e-grid .e-content {
    -webkit-overflow-scrolling: touch;
    touch-action: pan-x pan-y;
    overscroll-behavior: contain;
  }
`

/**
 * Initialize all performance optimizations
 * Call this once in your main.js file
 */
export function initializePerformanceOptimizations() {
  // Apply passive event listener optimization
  optimizeEventListeners()
  
  // Add CSS optimizations
  const style = document.createElement('style')
  style.textContent = touchOptimizationCSS
  document.head.appendChild(style)
  
  // Log optimization status
  if (import.meta.env.DEV) {
    console.log('✅ Touch event performance optimizations applied')
  }
}

/**
 * Alternative: Individual component optimization
 * Use this if you prefer to optimize specific components instead of globally
 */
export function optimizeComponentEvents(element) {
  if (!element) return
  
  // Apply touch-action CSS for better scroll performance
  element.style.touchAction = 'pan-x pan-y'
  element.style.webkitOverflowScrolling = 'touch'
  element.style.overscrollBehavior = 'contain'
  
  // Find and optimize child elements that might have scroll
  const scrollableElements = element.querySelectorAll('.e-content, .e-gantt, .scrollable')
  scrollableElements.forEach(el => {
    el.style.touchAction = 'pan-x pan-y'
    el.style.webkitOverflowScrolling = 'touch'
    el.style.overscrollBehavior = 'contain'
  })
}