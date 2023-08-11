import { NoteData, MusicSheet } from "./contracts";

export const notes = [
  {
    C: 130.81,
    "C#": 138.59,
    D: 146.83,
    "D#": 155.56,
    E: 164.81,
    F: 174.61,
    "F#": 185,
    G: 196,
    "G#": 207.65,
    A: 220,
    "A#": 233.08,
    B: 246.94,
  },
  {
    C: 261.63,
    "C#": 277.18,
    D: 293.66,
    "D#": 311.13,
    E: 329.63,
    F: 349.23,
    "F#": 369.99,
    G: 392,
    "G#": 415.3,
    A: 440,
    "A#": 466.16,
    B: 493.88,
  },
];

export class SoundChannel {
  context: AudioContext;
  masterGainNode: GainNode;
  oscillatorType: OscillatorType;

  constructor(context: AudioContext, oscillatorType: OscillatorType = "sine") {
    this.context = context;
    this.masterGainNode = context.createGain();
    this.oscillatorType = oscillatorType;
  }

  playSound(freq: number, duration: number = 50, volume: number = 0.2) {
    const { context, masterGainNode } = this;
    masterGainNode.gain.setValueAtTime(volume, context.currentTime);

    const oscillator = context.createOscillator();
    oscillator.type = this.oscillatorType;
    oscillator.frequency.setValueAtTime(freq, context.currentTime); // value in hertz
    oscillator.connect(this.masterGainNode);
    oscillator.start();
    oscillator.stop(context.currentTime + duration / 1000);
  }
}

export class Sound {
  context: AudioContext;
  masterGainNode: GainNode;

  channels: { [key: string]: SoundChannel } = {};

  constructor(channels: number | (string | null)[] = 1) {
    const context = new AudioContext();
    this.masterGainNode = context.createGain();
    this.masterGainNode.connect(context.destination);
    this.context = context;
    const toCreate = typeof channels === "number" ? channels : channels.length;

    for (let c = 0; c < toCreate; c++) {
      const channel = c.toString();
      const oscillatorType = typeof channels === "number" ? "sine" : (channels[c] as OscillatorType) || "sine";
      this.channels[channel] = new SoundChannel(context, oscillatorType);
      this.channels[channel].masterGainNode.connect(this.masterGainNode);
    }
  }

  playNote(channel: string, freq: number, duration: number = 50, volume: number = 0.2) {
    if (!this.channels[channel]) {
      console.warn(`Channel ${channel} not found`);
      return;
    }

    this.channels[channel].playSound(freq, duration, volume);
  }
}

export const genMusicSheet = (beat: number, music: NoteData[]): MusicSheet => {
  return music.map(n => ({
    ...n,
    d: n.d * beat,
    p: (n?.p || 0) * beat,
    s: (n?.s || 0) * beat,
    c: n?.c || 0,
  }));
};
