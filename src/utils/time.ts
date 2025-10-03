export function createDeltaTimer() {
  let lastTime = 0;
  
  return (currentTime: number = performance.now()) => {
    if (lastTime === 0) {
      lastTime = currentTime;
      return 1 / 60; // Default delta time for first frame
    }
    
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    
    // Clamp delta time to prevent large jumps
    return Math.min(deltaTime, 1 / 30); // Max 30 FPS minimum
  };
}

export function clampDeltaTime(deltaTime: number, maxDelta: number = 1/30): number {
  return Math.min(deltaTime, maxDelta);
}
