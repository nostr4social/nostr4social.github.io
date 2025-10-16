// Viewport utilities
document.addEventListener('DOMContentLoaded', function() {
  // Create a global object to store viewport dimensions
  window.viewportUtils = {
    width: 0,
    height: 0,
    vh: 0,
    vw: 0,
    
    // Function to update viewport dimensions
    update: function() {
      this.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      this.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      this.vh = this.height / 100;
      this.vw = this.width / 100;
      
      // Update CSS custom properties
      document.documentElement.style.setProperty('--vh', `${this.vh}px`);
      document.documentElement.style.setProperty('--vw', `${this.vw}px`);
      document.documentElement.style.setProperty('--vmin', `${Math.min(this.vh, this.vw)}px`);
      document.documentElement.style.setProperty('--vmax', `${Math.max(this.vh, this.vw)}px`);
      
      // Dispatch custom event
      const event = new CustomEvent('viewportChange', { 
        detail: { 
          width: this.width, 
          height: this.height,
          vh: this.vh,
          vw: this.vw
        } 
      });
      window.dispatchEvent(event);
      
      // Log for debugging
      console.log('Viewport updated:', {
        width: this.width,
        height: this.height,
        vh: this.vh,
        vw: this.vw
      });
    },
    
    // Initialize
    init: function() {
      // Set initial values
      this.update();
      
      // Update on resize and orientation change
      let resizeTimer;
      const handleResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => this.update(), 100);
      };
      
      window.addEventListener('resize', handleResize, { passive: true });
      window.addEventListener('orientationchange', handleResize, { passive: true });
      
      // Also update when the page is shown after being in the background (iOS Safari)
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          this.update();
        }
      });
    }
  };
  
  // Initialize viewport utils
  window.viewportUtils.init();
  
  // Add a small delay before logging to ensure initialization is complete
  setTimeout(() => {
    console.log('Viewport utils initialized');
    console.log('Initial viewport height:', window.viewportUtils.height);
    console.log('Initial viewport width:', window.viewportUtils.width);
  }, 100);
});