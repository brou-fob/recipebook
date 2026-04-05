function playRadarPattern(ctx) {
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    // Ascending sweep: 800 Hz → 1800 Hz over 0.3s
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.linearRampToValueAtTime(1800, now + 0.3);
    // Descending sweep: 1800 Hz → 800 Hz over 0.2s
    osc.frequency.linearRampToValueAtTime(800, now + 0.5);
    gain.gain.setValueAtTime(0.65, now);
    gain.gain.setValueAtTime(0.65, now + 0.5);
    gain.gain.linearRampToValueAtTime(0, now + 0.6);
    osc.start(now);
    osc.stop(now + 0.6);

    // Second harmonic for a more piercing sound
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(1600, now);
    osc2.frequency.linearRampToValueAtTime(3600, now + 0.3);
    osc2.frequency.linearRampToValueAtTime(1600, now + 0.5);
    gain2.gain.setValueAtTime(0.28, now);
    gain2.gain.setValueAtTime(0.28, now + 0.5);
    gain2.gain.linearRampToValueAtTime(0, now + 0.6);
    osc2.start(now);
    osc2.stop(now + 0.6);
  } catch (_) {
    // Audio API not available – silently ignore
  }
}

function playChimePattern(ctx) {
  try {
    const now = ctx.currentTime;
    // Gentle bell: sine wave with fast attack and slow exponential decay
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1047, now); // C6
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.7, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc.start(now);
    osc.stop(now + 0.9);
    // Higher harmonic for richness
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2093, now); // C7
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.3, now + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.start(now);
    osc2.stop(now + 0.6);
  } catch (_) {
    // Audio API not available – silently ignore
  }
}

function playBeepPattern(ctx) {
  try {
    const now = ctx.currentTime;
    // Three short square-wave beeps
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, now + i * 0.22);
      gain.gain.setValueAtTime(0.5, now + i * 0.22);
      gain.gain.setValueAtTime(0.5, now + i * 0.22 + 0.1);
      gain.gain.linearRampToValueAtTime(0, now + i * 0.22 + 0.13);
      osc.start(now + i * 0.22);
      osc.stop(now + i * 0.22 + 0.15);
    }
  } catch (_) {
    // Audio API not available – silently ignore
  }
}

function playCrystalPattern(ctx) {
  try {
    const now = ctx.currentTime;
    // High-pitched crystal bell: sine wave with very fast attack, long decay
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2093, now); // C7
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
    osc.start(now);
    osc.stop(now + 1.1);
    // Sub-tone for body
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1568, now); // G6
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.25, now + 0.01);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.start(now);
    osc2.stop(now + 0.7);
  } catch (_) {
    // Audio API not available – silently ignore
  }
}

function playAlertPattern(ctx) {
  try {
    const now = ctx.currentTime;
    // Two ascending sawtooth tones – urgent feel
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440 + i * 220, now + i * 0.27);
      osc.frequency.linearRampToValueAtTime(880 + i * 220, now + i * 0.27 + 0.22);
      gain.gain.setValueAtTime(0.55, now + i * 0.27);
      gain.gain.linearRampToValueAtTime(0, now + i * 0.27 + 0.22);
      osc.start(now + i * 0.27);
      osc.stop(now + i * 0.27 + 0.25);
    }
  } catch (_) {
    // Audio API not available – silently ignore
  }
}

export function playAlarmPattern(ctx, soundKey) {
  switch (soundKey) {
    case 'chime':   playChimePattern(ctx);   break;
    case 'beep':    playBeepPattern(ctx);    break;
    case 'crystal': playCrystalPattern(ctx); break;
    case 'alert':   playAlertPattern(ctx);   break;
    default:        playRadarPattern(ctx);   break;
  }
}

export async function previewAlarmSound(soundKey) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    playAlarmPattern(ctx, soundKey);
    // Close the temporary context once the longest pattern (crystal: ~1.1 s) has
    // fully faded out. 1500 ms provides a safe margin across all alarm patterns.
    setTimeout(() => { try { ctx.close(); } catch (_) {} }, 1500);
  } catch (_) {
    // Audio API nicht verfügbar – ignorieren
  }
}
