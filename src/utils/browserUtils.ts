/**
 * Browser Detection Utilities
 * Handles cross-browser compatibility checks
 */

export interface BrowserInfo {
  isIOS: boolean;
  isSafari: boolean;
  isAndroid: boolean;
  isChrome: boolean;
  supportsDownloadAttribute: boolean;
  supportsWebShare: boolean;
  supportsWebShareFiles: boolean;
}

function getBrowserInfo(): BrowserInfo {
  const ua = navigator.userAgent;
  
  // iOS detection (including iPad with desktop mode)
  const isIOS = /iPad|iPhone|iPod/.test(ua) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  // Safari detection (excludes Chrome on iOS)
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  
  // Android detection
  const isAndroid = /Android/i.test(ua);
  
  // Chrome detection (excludes Edge)
  const isChrome = /Chrome/i.test(ua) && !/Edg/i.test(ua);
  
  // iOS Safari does NOT support download attribute
  const supportsDownloadAttribute = !(isIOS && isSafari);
  
  // Web Share API availability
  const supportsWebShare = 'share' in navigator;
  
  // Web Share with files - iOS Safari does NOT support this
  let supportsWebShareFiles = false;
  if (supportsWebShare && 'canShare' in navigator) {
    try {
      const testFile = new File([''], 'test.mp4', { type: 'video/mp4' });
      supportsWebShareFiles = navigator.canShare?.({ files: [testFile] }) ?? false;
    } catch {
      supportsWebShareFiles = false;
    }
  }
  
  return {
    isIOS,
    isSafari,
    isAndroid,
    isChrome,
    supportsDownloadAttribute,
    supportsWebShare,
    supportsWebShareFiles,
  };
}

// Singleton cache for performance
let cachedInfo: BrowserInfo | null = null;

/**
 * Get browser information (cached)
 */
export function browser(): BrowserInfo {
  if (!cachedInfo) {
    cachedInfo = getBrowserInfo();
  }
  return cachedInfo;
}

/**
 * Check if running as installed PWA
 */
export function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;
}
