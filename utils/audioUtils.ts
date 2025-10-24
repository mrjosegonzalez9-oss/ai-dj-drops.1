
import type { EffectSettings } from '../types';

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function pcmToAudioBuffer(
  base64: string,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const data = decode(base64);
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function floatTo16BitPCM(output: DataView, offset: number, input: Float32Array) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

export async function audioBufferToWav(buffer: AudioBuffer, effects: EffectSettings): Promise<Blob> {
    const newLength = Math.floor(buffer.length / effects.playbackRate);
    const offlineCtx = new OfflineAudioContext(buffer.numberOfChannels, newLength, buffer.sampleRate);
    
    // Build the same effect chain in the offline context
    const source = offlineCtx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = effects.playbackRate;

    let lastNode: AudioNode = source;

    // EQ
    const lowShelf = offlineCtx.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = 320;
    lowShelf.gain.value = effects.eqLow;
    lastNode.connect(lowShelf);
    lastNode = lowShelf;

    const midPeak = offlineCtx.createBiquadFilter();
    midPeak.type = 'peaking';
    midPeak.frequency.value = 1000;
    midPeak.Q.value = 1;
    midPeak.gain.value = effects.eqMid;
    lastNode.connect(midPeak);
    lastNode = midPeak;

    const highShelf = offlineCtx.createBiquadFilter();
    highShelf.type = 'highshelf';
    highShelf.frequency.value = 3200;
    highShelf.gain.value = effects.eqHigh;
    lastNode.connect(highShelf);
    lastNode = highShelf;

    // Delay
    const delayNode = offlineCtx.createDelay(1.0);
    delayNode.delayTime.value = effects.delayTime;
    const feedbackNode = offlineCtx.createGain();
    feedbackNode.gain.value = effects.delayFeedback;
    
    lastNode.connect(delayNode);
    delayNode.connect(feedbackNode);
    feedbackNode.connect(delayNode);

    const mixNode = offlineCtx.createGain();
    lastNode.connect(mixNode);
    feedbackNode.connect(mixNode);
    lastNode = mixNode;

    // Reverb
    const reverbDry = offlineCtx.createGain();
    reverbDry.gain.value = 1 - (effects.reverb / 100);
    lastNode.connect(reverbDry);
    reverbDry.connect(offlineCtx.destination);

    const reverbWet = offlineCtx.createGain();
    reverbWet.gain.value = effects.reverb / 100;
    lastNode.connect(reverbWet);

    const convolver = offlineCtx.createConvolver();
    const impulseLength = offlineCtx.sampleRate * 2;
    const impulse = offlineCtx.createBuffer(2, impulseLength, offlineCtx.sampleRate);
    const leftImpulse = impulse.getChannelData(0);
    const rightImpulse = impulse.getChannelData(1);
    for (let i = 0; i < impulseLength; i++) {
        leftImpulse[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / impulseLength, 2.5);
        rightImpulse[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / impulseLength, 2.5);
    }
    convolver.buffer = impulse;
    reverbWet.connect(convolver);
    convolver.connect(offlineCtx.destination);
    
    source.start(0);

    const renderedBuffer = await offlineCtx.startRendering();

    const numOfChan = renderedBuffer.numberOfChannels;
    const length = renderedBuffer.length * numOfChan * 2 + 44;
    const bufferView = new ArrayBuffer(length);
    const view = new DataView(bufferView);
    const channels = [];
    let sample;
    let offset = 0;
    let pos = 0;

    // write WAV container
    writeString(view, pos, 'RIFF'); pos += 4;
    view.setUint32(pos, length - 8, true); pos += 4;
    writeString(view, pos, 'WAVE'); pos += 4;
    writeString(view, pos, 'fmt '); pos += 4;
    view.setUint32(pos, 16, true); pos += 4;
    view.setUint16(pos, 1, true); pos += 2;
    view.setUint16(pos, numOfChan, true); pos += 2;
    view.setUint32(pos, renderedBuffer.sampleRate, true); pos += 4;
    view.setUint32(pos, renderedBuffer.sampleRate * 2 * numOfChan, true); pos += 4;
    view.setUint16(pos, numOfChan * 2, true); pos += 2;
    view.setUint16(pos, 16, true); pos += 2;
    writeString(view, pos, 'data'); pos += 4;
    view.setUint32(pos, length - pos - 4, true); pos += 4;

    for (let i = 0; i < renderedBuffer.numberOfChannels; i++) {
        channels.push(renderedBuffer.getChannelData(i));
    }

    while (pos < length) {
        for (let i = 0; i < numOfChan; i++) {
            sample = Math.max(-1, Math.min(1, channels[i][offset]));
            sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }

    return new Blob([view], { type: 'audio/wav' });
}