import createWebAudioClass from "./APIs/WebAudio"
import createNoAudioClass from "./APIs/NoAudio"

export const webAudioSupported = AudioContext !== undefined && AudioContext !== null
const SoundClass = webAudioSupported ? createWebAudioClass(): createNoAudioClass()

export default SoundClass