/**
 * Antigravity 3D Soccer - Synthesized Web Audio Engine
 * Generates procedural realistic sound effects for whistle, crowd, kicks and goals
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.crowdNode = null;
        this.crowdGain = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.initCrowdAmbience();
            this.initialized = true;
        } catch (e) {
            console.warn("Web Audio not supported or blocked", e);
        }
    }

    ensureContext() {
        if (!this.initialized) {
            this.init();
        }
        if (this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume();
        }
    }

    // Whistle synthesis (Referee whistle with dual-frequency flutter)
    playWhistle(type = "short") {
        if (this.isMuted) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const duration = type === "long" ? 1.2 : (type === "double" ? 0.7 : 0.4);

        const playTone = (start, dur) => {
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const lfo = this.ctx.createOscillator();
            const lfoGain = this.ctx.createGain();

            osc1.type = "sine";
            osc2.type = "sine";
            osc1.frequency.setValueAtTime(2850, start);
            osc2.frequency.setValueAtTime(3120, start);

            // Tremolo / flutter typical of referee whistles
            lfo.frequency.setValueAtTime(32, start);
            lfoGain.gain.setValueAtTime(120, start);
            lfo.connect(osc1.frequency);
            lfo.connect(osc2.frequency);

            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.3, start + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(this.ctx.destination);

            lfo.start(start);
            osc1.start(start);
            osc2.start(start);

            lfo.stop(start + dur);
            osc1.stop(start + dur);
            osc2.stop(start + dur);
        };

        if (type === "double") {
            playTone(now, 0.22);
            playTone(now + 0.28, 0.35);
        } else {
            playTone(now, duration);
        }
    }

    // Ball kick thump
    playKick(power = 1.0) {
        if (this.isMuted) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const baseFreq = 160 + (power * 40);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(38, now + 0.12);

        const vol = Math.min(0.6, 0.2 + (power * 0.3));
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        // Sub-bass punch
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        // Click / shoe tap noise
        const bufferSize = this.ctx.sampleRate * 0.05;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.value = 1400;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(vol * 0.5, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        osc.start(now);
        noise.start(now);
        osc.stop(now + 0.15);
        noise.stop(now + 0.06);
    }

    // Goalpost strike clank
    playPostHit() {
        if (this.isMuted) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const freqs = [820, 1640, 2450];
        freqs.forEach(f => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(f, now);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.45);
        });
    }

    // Continuous dynamic stadium crowd ambience
    initCrowdAmbience() {
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.02 * white)) / 1.02; // Pink/Brown noise
            lastOut = data[i];
            data[i] *= 1.8;
        }

        this.crowdNode = this.ctx.createBufferSource();
        this.crowdNode.buffer = buffer;
        this.crowdNode.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 450;
        filter.Q.value = 1.2;

        this.crowdGain = this.ctx.createGain();
        this.crowdGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

        this.crowdNode.connect(filter);
        filter.connect(this.crowdGain);
        this.crowdGain.connect(this.ctx.destination);

        this.crowdNode.start(0);
    }

    // Adjust crowd excitement based on game tension (e.g. ball near goal)
    setCrowdTension(tension) {
        if (!this.crowdGain || !this.ctx) return;
        const targetVol = 0.08 + (Math.max(0, Math.min(1, tension)) * 0.28);
        this.crowdGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.4);
    }

    // Massive Goal celebration cheer + horns
    playGoalCelebration() {
        if (this.isMuted) return;
        this.ensureContext();
        if (!this.ctx) return;

        this.playWhistle("double");

        // Crowd roar surge
        if (this.crowdGain) {
            this.crowdGain.gain.cancelScheduledValues(this.ctx.currentTime);
            this.crowdGain.gain.setValueAtTime(0.45, this.ctx.currentTime);
            this.crowdGain.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 4.5);
        }

        // Stadium celebration horn / blast
        const now = this.ctx.currentTime + 0.1;
        [220, 277, 330, 440].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.linearRampToValueAtTime(freq * 1.05, now + 1.8);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
            gain.gain.setValueAtTime(0.12, now + 1.2);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

            const filter = this.ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.value = 1600;

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 2.3);
        });
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.crowdGain) {
            this.crowdGain.gain.setValueAtTime(this.isMuted ? 0 : 0.12, this.ctx.currentTime);
        }
        return this.isMuted;
    }
}

window.soundEngine = new SoundEngine();
