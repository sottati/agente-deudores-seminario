#!/usr/bin/env python3
"""
Genera la pista de audio sincronizada (12.075 s, 124 BPM) para PactaSting:
- Base musical: "Rising Forest" (Diego Nava, Mixkit free license), ajustada
  exactamente a 124 BPM con el drop alineado en el beat 5 (2.467 s), 2 frames
  después del corte f72 (2.400 s).
- SFX sintetizados: impacto inicial (0.10 s), whooshes con pico en los cortes
  (2.402, 3.370, 5.305, 10.043 s), golpes de transición (6.240, 8.175 s),
  clics de cursor (2.33, 3.83 s), ticks suaves de teclado (4.04–5.00 s) y
  shimmer final (10.05 s).
- Masterizado a -14 LUFS, true peak -1 dBTP, fade-out de 60 ms al final.
"""
import math
import os
import subprocess
import numpy as np

SR = 44100
DURATION = 12.075
N = int(round(DURATION * SR))

SRC_MP3 = "/tmp/rising-forest.mp3"
OUT_DIR = "/data/uade/seminario/agente-deudores-seminario/apps/video/public/audio"
OUT_MP3 = os.path.join(OUT_DIR, "pacta-sting.mp3")
TMP_RAW_WAV = "/tmp/pacta-sting-premaster.wav"


def load_music_bed() -> np.ndarray:
    """
    Rising Forest original: BPM ~123.85, drop exacto en 15.500 s.
    Queremos 124.000 BPM (tempo ratio = 124.0 / 123.85 = 1.00121) y que el drop
    caiga exactamente en t = 2.467 s (beat 5 = 0.048 + 5 * 0.48387).
    Por lo tanto arrancamos el recorte en:
      src_start = 15.500 - 2.467 * 1.00121 = 13.030 s
    """
    tempo = 124.0 / 123.85
    src_start = 15.500 - 2.467 * tempo
    cmd = [
        "ffmpeg", "-v", "error",
        "-ss", f"{src_start:.4f}",
        "-i", SRC_MP3,
        "-t", f"{DURATION + 0.25:.4f}",
        "-af", f"atempo={tempo:.6f}",
        "-ac", "2", "-ar", str(SR),
        "-f", "f32le", "-",
    ]
    raw = subprocess.check_output(cmd)
    audio = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()
    if len(audio) < N:
        pad = np.zeros((N - len(audio), 2), dtype=np.float32)
        audio = np.vstack([audio, pad])
    else:
        audio = audio[:N]

    # Suaviza ligeramente la entrada (primeros 120 ms) para evitar clic
    fade_in = int(0.12 * SR)
    audio[:fade_in] *= np.linspace(0.0, 1.0, fade_in)[:, None]
    return audio


def add_stereo(buf: np.ndarray, sig: np.ndarray, t_sec: float, gain: float = 1.0, pan: float = 0.0):
    i0 = int(round(t_sec * SR))
    if sig.ndim == 1:
        l_gain = gain * math.cos((pan + 1.0) * math.pi / 4.0)
        r_gain = gain * math.sin((pan + 1.0) * math.pi / 4.0)
        stereo = np.stack([sig * l_gain, sig * r_gain], axis=1)
    else:
        stereo = sig * gain

    j0 = max(0, i0)
    j1 = min(N, i0 + len(stereo))
    if j1 <= j0:
        return
    s0 = j0 - i0
    s1 = s0 + (j1 - j0)
    buf[j0:j1] += stereo[s0:s1]


def bandpass_noise(rng: np.random.Generator, length: int, f_low: float, f_high: float) -> np.ndarray:
    x = rng.standard_normal(length)
    X = np.fft.rfft(x)
    freqs = np.fft.rfftfreq(length, 1.0 / SR)
    mask = np.exp(-0.5 * ((np.log2(np.maximum(freqs, 1.0) / math.sqrt(f_low * f_high))) / 0.65) ** 2)
    mask[freqs < f_low * 0.5] = 0.0
    mask[freqs > f_high * 1.8] = 0.0
    y = np.fft.irfft(X * mask, n=length)
    mx = np.max(np.abs(y)) + 1e-8
    return (y / mx).astype(np.float32)


def synth_soft_impact(rng: np.random.Generator) -> np.ndarray:
    dur = 0.45
    n = int(dur * SR)
    t = np.arange(n) / SR
    # Pitch drop sub sine 120 -> 42 Hz
    freq = 42.0 + 78.0 * np.exp(-t / 0.055)
    phase = 2.0 * np.pi * np.cumsum(freq) / SR
    sub = np.sin(phase) * np.exp(-t / 0.14) * (1.0 - np.exp(-t / 0.004))
    air = bandpass_noise(rng, n, 300, 1400) * np.exp(-t / 0.06) * 0.25
    return (sub + air).astype(np.float32)


def synth_whoosh(rng: np.random.Generator, pre: float = 0.26, post: float = 0.20, bright: bool = False) -> np.ndarray:
    """Whoosh con pico exactamente en t = pre."""
    dur = pre + post
    n = int(dur * SR)
    t = np.arange(n) / SR
    # Envolvente asimétrica con pico en `pre`
    env = np.where(
        t < pre,
        (t / pre) ** 2.6,
        np.exp(-(np.maximum(0.0, t - pre) / (post * 0.38)) ** 1.4),
    )
    low_band = bandpass_noise(rng, n, 180, 700)
    mid_band = bandpass_noise(rng, n, 600, 2600 if not bright else 4200)
    hi_band = bandpass_noise(rng, n, 2400, 7500 if bright else 5500)
    # Barrido espectral hacia el pico
    sweep = np.clip(1.0 - np.abs(t - pre) / pre, 0.0, 1.0)
    sig = (low_band * 0.45 + mid_band * (0.4 + 0.6 * sweep) + hi_band * (sweep ** 2) * (0.55 if bright else 0.35)) * env
    # Subtle resonant body
    f_res = 220.0 + 480.0 * sweep
    sig += 0.12 * np.sin(2.0 * np.pi * np.cumsum(f_res) / SR) * env
    return sig.astype(np.float32)


def synth_transition_hit(rng: np.random.Generator) -> np.ndarray:
    dur = 0.36
    n = int(dur * SR)
    t = np.arange(n) / SR
    freq = 58.0 + 130.0 * np.exp(-t / 0.025)
    body = np.sin(2.0 * np.pi * np.cumsum(freq) / SR) * np.exp(-t / 0.095)
    snap = bandpass_noise(rng, n, 900, 4800) * np.exp(-t / 0.028) * 0.45
    return ((body + snap) * (1.0 - np.exp(-t / 0.002))).astype(np.float32)


def synth_click(rng: np.random.Generator) -> np.ndarray:
    dur = 0.045
    n = int(dur * SR)
    t = np.arange(n) / SR
    # Crisp macOS trackpad/mouse click (double micro-transient)
    c1 = np.sin(2.0 * np.pi * 1850.0 * t) * np.exp(-t / 0.0035)
    c2 = bandpass_noise(rng, n, 1600, 6500) * np.exp(-t / 0.004) * 0.7
    t2 = np.maximum(0.0, t - 0.011)
    release = np.where(t >= 0.011, np.sin(2.0 * np.pi * 2400.0 * t2) * np.exp(-t2 / 0.0025) * 0.4, 0.0)
    return (c1 * 0.75 + c2 * 0.6 + release).astype(np.float32)


def synth_key_tick(rng: np.random.Generator, pitch_jitter: float) -> np.ndarray:
    dur = 0.028
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 2600.0 * pitch_jitter
    tone = np.sin(2.0 * np.pi * f * t) * np.exp(-t / 0.0025)
    tap = bandpass_noise(rng, n, 1800, 6200) * np.exp(-t / 0.003) * 0.65
    return (tone * 0.45 + tap * 0.55).astype(np.float32)


def synth_shimmer() -> np.ndarray:
    dur = 1.90
    n = int(dur * SR)
    t = np.arange(n) / SR
    env = (1.0 - np.exp(-t / 0.06)) * np.exp(-t / 0.72)
    # Lush glassy fifth + ninth chord shimmer (D major / B minor color matching warm track)
    freqs_l = [587.33, 880.0, 1174.66, 1760.0, 2217.46]
    freqs_r = [588.8, 878.5, 1176.8, 1756.5, 2221.0]
    amps = [0.22, 0.25, 0.22, 0.16, 0.10]
    l = np.zeros(n, dtype=np.float32)
    r = np.zeros(n, dtype=np.float32)
    for fl, fr, a in zip(freqs_l, freqs_r, amps):
        l += a * np.sin(2.0 * np.pi * fl * t)
        r += a * np.sin(2.0 * np.pi * fr * t)
    return np.stack([l * env, r * env], axis=1)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    rng = np.random.default_rng(20261124)

    music = load_music_bed() * 0.78
    sfx = np.zeros((N, 2), dtype=np.float32)

    # 1. Soft impact at 0.10 s
    add_stereo(sfx, synth_soft_impact(rng), 0.10, gain=0.42)

    # 2. Whooshes peaking at cuts: 2.402, 3.370, 5.305, 10.043 s
    for t_peak, pre, post, gain, bright in [
        (2.402, 0.24, 0.18, 0.40, False),
        (3.370, 0.22, 0.18, 0.38, True),
        (5.305, 0.26, 0.20, 0.46, True),
        (10.043, 0.28, 0.22, 0.44, True),
    ]:
        w = synth_whoosh(rng, pre=pre, post=post, bright=bright)
        add_stereo(sfx, w, t_peak - pre, gain=gain)

    # 3. Transition hits on 6.240 s (S5) and 8.175 s (S7)
    add_stereo(sfx, synth_transition_hit(rng), 6.240, gain=0.38)
    add_stereo(sfx, synth_transition_hit(rng), 8.175, gain=0.36)

    # 4. Crisp macOS clicks at 2.33 s (S1) and 3.83 s (S3)
    add_stereo(sfx, synth_click(rng), 2.33, gain=0.52)
    add_stereo(sfx, synth_click(rng), 3.83, gain=0.52)

    # 5. Subtle key ticks every ~32 ms over 4.04–5.00 s (matching 28 chars typing)
    t_key = 4.04
    idx = 0
    while t_key <= 5.00:
        jitter = 0.90 + 0.22 * ((idx * 37) % 11) / 10.0
        pan = -0.18 + 0.36 * ((idx * 17) % 9) / 8.0
        add_stereo(sfx, synth_key_tick(rng, jitter), t_key, gain=0.14, pan=pan)
        # 1-frame rhythm variation every 3 chars
        t_key += 0.033 if (idx % 3 != 2) else 0.044
        idx += 1

    # 6. Soft glassy shimmer at 10.05 s (end card arrival)
    add_stereo(sfx, synth_shimmer(), 10.05, gain=0.28)

    mix = music + sfx
    # Soft clip safety before loudness normalization
    mix = np.tanh(mix * 0.95) / 0.95

    # Exact 60 ms fade-out at the very end (prompt.txt rule)
    fade_out = int(0.060 * SR)
    mix[-fade_out:] *= np.linspace(1.0, 0.0, fade_out)[:, None]

    # Write 32-bit float WAV and master to -14 LUFS, -1 dBTP with ffmpeg loudnorm
    pcm = np.clip(mix, -1.0, 1.0)
    pcm16 = (pcm * 32767.0).astype(np.int16)

    import wave
    with wave.open(TMP_RAW_WAV, "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(pcm16.tobytes())

    subprocess.check_call([
        "ffmpeg", "-y", "-v", "error",
        "-i", TMP_RAW_WAV,
        "-af", "loudnorm=I=-14:TP=-1.0:LRA=9",
        "-c:a", "libmp3lame", "-b:a", "256k",
        OUT_MP3,
    ])
    print(f"Generated {OUT_MP3} ({DURATION:.3f}s)")


if __name__ == "__main__":
    main()
