import type { OnboardingCallbacks } from '../../app/types';
import { haptic, hapticSuccess } from '../../utils/haptic';

export function render(videoUrl: string | null): string {
  if (!videoUrl) {
    return `
      <div class="screen">
        <div class="screen-content centered">
          <p>No video available</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="screen">
      <div class="screen-content">
        <h1 class="title-large">Your AI Video</h1>
        <p class="body-text">Here's your creation!</p>
        
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
          <span>💾</span> Save Video
        </button>
        <button class="button-secondary" id="share-btn">
          <span>📤</span> Share
        </button>
        <button class="button-ghost" id="done-btn">Back to Home</button>
      </div>
    </div>
  `;
}

export function init(callbacks: OnboardingCallbacks, videoUrl: string | null): void {
  const downloadBtn = document.getElementById('download-btn');
  const shareBtn = document.getElementById('share-btn');
  const doneBtn = document.getElementById('done-btn');

  downloadBtn?.addEventListener('click', async () => {
    haptic('medium');
    if (!videoUrl) return;
    
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ai-video.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      hapticSuccess();
    } catch (error) {
      console.error('Download failed:', error);
    }
  });

  shareBtn?.addEventListener('click', async () => {
    haptic('medium');
    if (!videoUrl) return;
    
    try {
      if (navigator.share) {
        const response = await fetch(videoUrl);
        const blob = await response.blob();
        const file = new File([blob], 'ai-video.mp4', { type: 'video/mp4' });
        
        await navigator.share({
          title: 'My AI Video',
          text: 'Check out this AI-generated video!',
          files: [file],
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

  doneBtn?.addEventListener('click', () => {
    haptic('light');
    callbacks.onComplete();
  });

  // Unmute video on tap
  const video = document.querySelector('.result-video') as HTMLVideoElement;
  video?.addEventListener('click', () => {
    video.muted = !video.muted;
  });
}
