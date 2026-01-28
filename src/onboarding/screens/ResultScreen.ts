import type { OnboardingCallbacks } from '../../app/types';
import { browser } from '../../utils/browserUtils';
import { haptic, hapticSuccess } from '../../utils/haptic';

export function render(videoUrl: string | null): string {
  if (!videoUrl) {
    return `
      <div class="screen">
        <div class="screen-content centered">
          <h1 class="title-large">Something went wrong</h1>
          <p class="body-text">No video available</p>
          <button class="button-primary" id="retry-btn">Try Again</button>
        </div>
      </div>
    `;
  }

  const { isIOS } = browser();

  return `
    <div class="screen">
      <div class="screen-content">
        <h1 class="title-large">Your AI Video!</h1>
        <p class="body-text">Tap video to unmute</p>
        
        <div class="video-container">
          <video 
            src="${videoUrl}" 
            class="result-video" 
            controls 
            autoplay 
            loop 
            playsinline
            muted
          ></video>
        </div>
      </div>
      <div class="screen-footer">
        <button class="button-primary" id="download-btn">
          ${isIOS ? '📥 Save to Photos' : '💾 Download Video'}
        </button>
        <button class="button-secondary" id="share-btn">
          📤 Share
        </button>
        <button class="button-ghost" id="done-btn">Continue to App</button>
      </div>
    </div>
  `;
}

export function init(callbacks: OnboardingCallbacks, videoUrl: string | null): void {
  const downloadBtn = document.getElementById('download-btn');
  const shareBtn = document.getElementById('share-btn');
  const doneBtn = document.getElementById('done-btn');
  const retryBtn = document.getElementById('retry-btn');
  const video = document.querySelector('.result-video') as HTMLVideoElement;
  
  const browserInfo = browser();

  // Download handler
  downloadBtn?.addEventListener('click', async () => {
    haptic('medium');
    if (!videoUrl) return;
    
    try {
      if (browserInfo.isIOS && browserInfo.isSafari) {
        await handleIOSDownload(videoUrl);
      } else if (browserInfo.supportsDownloadAttribute) {
        await handleStandardDownload(videoUrl);
      } else {
        // Fallback: open in new tab
        window.open(videoUrl, '_blank');
      }
      hapticSuccess();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  });

  // Share handler
  shareBtn?.addEventListener('click', async () => {
    haptic('medium');
    if (!videoUrl) return;
    
    try {
      if (browserInfo.supportsWebShare) {
        await navigator.share({
          title: 'My AI Video',
          text: 'Check out my AI-generated video!',
          url: videoUrl,
        });
        hapticSuccess();
      } else {
        // Fallback: copy URL
        await navigator.clipboard.writeText(videoUrl);
        hapticSuccess();
        alert('Video URL copied to clipboard!');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Share failed:', error);
      }
    }
  });

  // Done handler
  doneBtn?.addEventListener('click', () => {
    haptic('light');
    callbacks.onComplete();
  });

  // Retry handler (if no video)
  retryBtn?.addEventListener('click', () => {
    haptic('medium');
    callbacks.onNavigate('upload');
  });

  // Video unmute on tap
  video?.addEventListener('click', () => {
    video.muted = !video.muted;
  });
}

/**
 * iOS Safari download: Show modal with long-press instructions
 */
async function handleIOSDownload(videoUrl: string): Promise<void> {
  const downloadBtn = document.getElementById('download-btn');
  const originalText = downloadBtn?.textContent || '';
  if (downloadBtn) downloadBtn.textContent = 'Preparing...';
  
  try {
    // Fetch video as blob
    const response = await fetch(videoUrl);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    // Create iOS download modal
    const overlay = document.createElement('div');
    overlay.className = 'ios-download-overlay';
    overlay.innerHTML = `
      <div class="ios-download-modal">
        <video src="${blobUrl}" autoplay loop playsinline muted class="ios-download-video"></video>
        <div class="ios-download-instructions">
          <p><strong>To save to Photos:</strong></p>
          <p>1. Long press on the video above</p>
          <p>2. Tap "Save to Photos"</p>
        </div>
        <button class="button-primary ios-download-done">Done</button>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Close handler
    overlay.querySelector('.ios-download-done')?.addEventListener('click', () => {
      URL.revokeObjectURL(blobUrl);
      overlay.remove();
    });
    
    // Also close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        URL.revokeObjectURL(blobUrl);
        overlay.remove();
      }
    });
    
  } finally {
    if (downloadBtn) downloadBtn.textContent = originalText;
  }
}

/**
 * Standard download using anchor element
 */
async function handleStandardDownload(videoUrl: string): Promise<void> {
  const downloadBtn = document.getElementById('download-btn');
  const originalText = downloadBtn?.textContent || '';
  if (downloadBtn) downloadBtn.textContent = 'Downloading...';
  
  try {
    const response = await fetch(videoUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-video-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Delay cleanup to ensure download starts
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } finally {
    if (downloadBtn) downloadBtn.textContent = originalText;
  }
}
