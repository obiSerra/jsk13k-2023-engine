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
