export interface PullToRefreshOptions {
  container: HTMLElement;
  onRefresh: () => Promise<void>;
  threshold?: number;
}

export function initPullToRefresh(options: PullToRefreshOptions): () => void {
  const { container, onRefresh, threshold = 80 } = options;
  
  let startY = 0;
  let pulling = false;
  let refreshing = false;
  
  // Create indicator - positioned at top center of page
  const indicator = document.createElement('div');
  indicator.className = 'ptr-indicator';
  indicator.innerHTML = `
    <div class="ptr-content">
      <svg class="ptr-spinner" viewBox="0 0 24 24" width="28" height="28">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" 
                stroke-width="2.5" stroke-linecap="round"
                stroke-dasharray="31.4" stroke-dashoffset="31.4"/>
      </svg>
    </div>
  `;
  
  // Insert at top of container (after header area)
  const content = container.querySelector('.home-content');
  if (content) {
    content.insertBefore(indicator, content.firstChild);
  } else {
    container.insertBefore(indicator, container.firstChild);
  }
  
  const circle = indicator.querySelector('circle') as SVGCircleElement;
  
  const onTouchStart = (e: TouchEvent) => {
    if (refreshing) return;
    if (container.scrollTop > 5) return; // Only at top
    
    startY = e.touches[0].clientY;
    pulling = true;
  };
  
  const onTouchMove = (e: TouchEvent) => {
    if (!pulling || refreshing) return;
    
    const y = e.touches[0].clientY;
    const delta = y - startY;
    
    // Only pull down, and only when at top
    if (delta > 0 && container.scrollTop <= 0) {
      // Use easing for more natural feel
      const progress = Math.min(delta / threshold, 1.5);
      const easedOffset = Math.min(delta * 0.4, threshold * 1.2);
      
      indicator.style.transform = `translateY(${easedOffset}px)`;
      indicator.style.opacity = String(Math.min(progress, 1));
      
      // Update circle progress with smooth animation
      if (circle) {
        const dashOffset = 31.4 * (1 - Math.min(progress, 1));
        circle.style.strokeDashoffset = String(dashOffset);
      }
      
      if (delta > 15) {
        e.preventDefault(); // Prevent scroll when pulling
      }
    }
  };
  
  const onTouchEnd = async () => {
    if (!pulling) return;
    pulling = false;
    
    const currentOffset = parseFloat(indicator.style.transform?.match(/translateY\(([\d.]+)px\)/)?.[1] || '0');
    
    if (currentOffset >= threshold * 0.8 && !refreshing) {
      refreshing = true;
      indicator.classList.add('refreshing');
      indicator.style.transform = `translateY(${threshold}px)`;
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
      
      try {
        await onRefresh();
      } finally {
        // Smooth transition back
        indicator.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        refreshing = false;
        indicator.classList.remove('refreshing');
        indicator.style.transform = 'translateY(0)';
        indicator.style.opacity = '0';
        if (circle) circle.style.strokeDashoffset = '31.4';
        
        // Reset transition
        setTimeout(() => {
          indicator.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
        }, 300);
      }
    } else {
      // Cancelled pull - snap back
      indicator.style.transform = 'translateY(0)';
      indicator.style.opacity = '0';
      if (circle) circle.style.strokeDashoffset = '31.4';
    }
    
    startY = 0;
  };
  
  container.addEventListener('touchstart', onTouchStart, { passive: true });
  container.addEventListener('touchmove', onTouchMove, { passive: false });
  container.addEventListener('touchend', onTouchEnd, { passive: true });
  container.addEventListener('touchcancel', onTouchEnd, { passive: true });
  
  return () => {
    container.removeEventListener('touchstart', onTouchStart);
    container.removeEventListener('touchmove', onTouchMove);
    container.removeEventListener('touchend', onTouchEnd);
    container.removeEventListener('touchcancel', onTouchEnd);
    indicator.remove();
  };
}
