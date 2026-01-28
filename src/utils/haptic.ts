/**
 * Haptic feedback utility for native-like feel
 */
export function haptic(style: 'light' | 'medium' | 'heavy' = 'light'): void {
  if ('vibrate' in navigator) {
    const duration = style === 'light' ? 10 : style === 'medium' ? 20 : 30;
    navigator.vibrate(duration);
  }
}

/**
 * Haptic feedback for selection changes
 */
export function hapticSelection(): void {
  haptic('light');
}

/**
 * Haptic feedback for success actions
 */
export function hapticSuccess(): void {
  if ('vibrate' in navigator) {
    navigator.vibrate([10, 50, 10]);
  }
}

/**
 * Haptic feedback for errors
 */
export function hapticError(): void {
  if ('vibrate' in navigator) {
    navigator.vibrate([30, 50, 30]);
  }
}
