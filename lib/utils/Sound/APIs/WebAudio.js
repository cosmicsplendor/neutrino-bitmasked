import { clamp } from "@lib/utils/math";

const createWebAudio = () => {
    const ctx = new AudioContext();
    // console.log("speaker channels",  ctx.destination.channelCount)
    const decodeAudioData = (arrayBuffer) => {
        return new Promise((resolve, reject) => {
            ctx.decodeAudioData(arrayBuffer, resolve, reject);
        });
    };

    const getBufferNodeStartFn = (node) => {
        return (startTime, from, duration) => {
            if (node.loop) {
                node.loopStart = from;
                node.loopEnd = from + duration;
                return node.start(startTime, from);
            }
            node.start(startTime, from, duration);
        };
    };

    // Frequency mapping (only used if filter is enabled)
    const MIN_FREQ = 20;
    const MAX_FREQ = 20000;
    const normalizedToFrequency = (normalized) => {
        return MIN_FREQ + normalized * (MAX_FREQ - MIN_FREQ);
    };
    const masterVolume = ctx.createGain(); // Global volume control
    masterVolume.gain.value = 1; // Default volume
    masterVolume.connect(ctx.destination);
    class Sound {
        static _on = true;
        static getPaused() { return this._on; }
        static off() { this._on = false; }
        static on() { this._on = true; }
        static onCreated() { } // on sound object created
        static onDestroyed() { } // on sound object destroyed
        static destroy(soundObj) {
            Sound.onDestroyed(soundObj)
        }
        detached=false
        static setMasterVolume(value) {
            masterVolume.gain.setValueAtTime(clamp(0, 1, value), ctx.currentTime);
        }
        static loadResource = (src) => {
            return new Promise((resolve, reject) => {
                fetch(src)
                    .then(res => res.arrayBuffer())
                    .then(arrayBuffer => decodeAudioData(arrayBuffer))
                    .then(audioBuffer => resolve(audioBuffer))
                    .catch(() => reject({ message: "Failed to load audio" }));
            });
        };

        constructor(buffer, {
            loop = false,
            volume = 1,
            pan = 0,
            speed = 1,
            pitch = 0,
            filter = 1,
            stereoPan = false,
            lpFilter = false,
            detached=false
        } = {}) {
            this.buffer = buffer;
            this.volumeNode = ctx.createGain();
            
            // Conditional node creation
            if (stereoPan) {
                this.panNode = ctx.createStereoPanner();
                this.panNode.pan.value = pan;
            }
            
            if (lpFilter) {
                this.filterNode = ctx.createBiquadFilter();
                this.filterNode.type = 'lowpass';
                this.filterNode.frequency.value = normalizedToFrequency(filter);
            }

            // State properties
            this._pitch = pitch
            this._speed = speed;
            this._loop = loop;
            this._filter = lpFilter ? filter : 1;
            
            // Volume is always required
            this.volumeNode.gain.value = volume;
            
            // Playback state
            this.playedFrom = 0;
            this.offset = 0;
            this.playTill = buffer.duration;
            this.lastPlayedAt = 0;
            this.playing = false;
            this.onEnded = () => this.playing = false;
            Sound.onCreated(this)
            this.detached = detached
        }

        // Simplified property setters/getters
        set speed(val) {
            this._speed = val;
            if (this.sourceNode) {
                this.sourceNode.playbackRate.setValueAtTime(val, ctx.currentTime);
            }
        }

        set pitch(val) {
            this._pitch = val;
            if (this.sourceNode) {
                this.sourceNode.detune.setValueAtTime(val * 100, ctx.currentTime);
            }
        }

        set volume(val) {
            this.volumeNode.gain.setValueAtTime(val, ctx.currentTime);
        }

        set pan(val) {
            if (!this.panNode) return;
            this.panNode.pan.setValueAtTime(clamp(-1, 1, val), ctx.currentTime);
        }

        set filter(val) {
            if (!this.filterNode) return;
            this._filter = Math.max(0, Math.min(1, val));
            this.filterNode.frequency.setValueAtTime(
                normalizedToFrequency(this._filter),
                ctx.currentTime
            );
        }

        // Play/pause/resume logic
        _play(from, duration) {
            const sourceNode = ctx.createBufferSource();
            const startSourceNode = getBufferNodeStartFn(sourceNode);
            this.sourceNode = sourceNode;
            this.lastPlayedAt = ctx.currentTime;

            sourceNode.buffer = this.buffer;
            sourceNode.loop = this._loop;
            sourceNode.playbackRate.value = this._speed;
            
            if (this._pitch) {
                sourceNode.detune.value = this._pitch * 100;
            }

            // Dynamic audio routing
            let currentNode = sourceNode;
            if (this.filterNode) {
                currentNode.connect(this.filterNode);
                currentNode = this.filterNode;
            }
            if (this.panNode) {
                currentNode.connect(this.panNode);
                currentNode = this.panNode;
            }
            currentNode.connect(this.volumeNode);
            this.volumeNode.connect(this.detached ? ctx.destination: masterVolume);

            startSourceNode(ctx.currentTime, from, duration);
            sourceNode.onended = this.onEnded;
            this.playing = true;
        }

        pause() {
            if (!this.playing) return;
            const timeSinceLastPlayed = ctx.currentTime - this.lastPlayedAt;
            const newOffset = this.offset + timeSinceLastPlayed;
            const duration = this.playTill - this.playedFrom;
            this.offset = this._loop ? newOffset % duration : Math.min(newOffset, duration);
            this._stop();
        }

        resume() {
            if (this.playing || !Sound._on) return;
            const { playedFrom, offset, playTill } = this;
            const resFrom = playedFrom + offset;
            const duration = playTill - resFrom;
            this._play(resFrom, duration);
        }

        play(from = 0, _duration, volume, pitch) {
            if (this.playing || !Sound._on) return;
            if (volume !== undefined) this.volume = volume;
            if (pitch !== undefined) this.pitch = pitch;
            const duration = _duration || this.buffer.duration;
            this.playedFrom = from;
            this.offset = 0;
            this.playTill = from + duration;
            this.lastPlayedAt = ctx.currentTime;
            this._play(from, duration);
        }

        _stop() {
            const { sourceNode } = this;
            sourceNode && sourceNode.stop(0);
        }
        destroy() {
            this.pause()
            Sound.destroy(this)
        }
    }

    return Sound;
};

export default createWebAudio