export default class Visualizer {
  source
  count
  ac
  draw
  size
  gainNode
  analyser
  rafId
  xhr
  volume
  duration
  currentTime
  curr
  total

  constructor({ draw, size, volume, currentTime }) {
    this.source = null
    this.count = 0
    this.ac = new AudioContext()
    this.draw = draw
    this.size = size
    this.gainNode = this.ac.createGain()
    this.gainNode.gain.value = this.volume = volume
    this.gainNode.connect(this.ac.destination)
    this.analyser = this.ac.createAnalyser()
    this.analyser.fftSize = this.size * 2
    this.analyser.connect(this.gainNode)
    this.currentTime = currentTime
  }

  load = (url, callback, progressCb) => {
    this.xhr = new XMLHttpRequest()
    this.abort()
    this.xhr.open('GET', url)
    this.xhr.responseType = 'arraybuffer'
    this.xhr.onload = () => {
      callback(this.xhr.response)
    }
    this.xhr.onprogress = v => {
      const { loaded, total } = v
      progressCb(loaded / total * 100)
    }
    this.xhr.send()
  }

  abort = () => this.xhr && this.xhr.abort()

  play = ({src, cb, progressCb}) => {
    const n = ++this.count
    if (this.source) {
      this.source.stop()
    }
    const decodeCallback = buffer => {
      this.duration = buffer.duration
      if (n === this.count && this.ac) { 
        try {
          const bufferSource = this.ac.createBufferSource()
          bufferSource.buffer = buffer
          bufferSource.loop = true
          bufferSource.connect(this.analyser)
          bufferSource.start()
          this.source = bufferSource
          this.visualize()
          cb()
        } catch(e) {
          console.log(e)
        }
      }
    }
    if (src instanceof ArrayBuffer) {
      this.ac.decodeAudioData(src, decodeCallback)
    } else {
      this.load(src, arrayBuffer => {
        this.ac.decodeAudioData(arrayBuffer, decodeCallback)
      }, progressCb)
    }
  }

  updateVolume = vol => {
    this.gainNode.gain.value = this.volume = vol
  }

  visualize = () => {
    const arr = new Uint8Array(this.analyser.frequencyBinCount)
    const raf = window.requestAnimationFrame
    const fn = () => {
      this.analyser.getByteFrequencyData(arr)
      this.draw(arr, this.volume)
      this.rafId = raf(fn)
      const curr = this.ac.currentTime.toFixed(0)
      const total = this.duration.toFixed(0)
      if (!this.curr || this.curr !== curr) {
        this.curr = curr
        this.currentTime({ curr, total })
      }
    }
    fn()
  }

  pause = () => {
    this.ac.suspend()
    window.cancelAnimationFrame(this.rafId)
  }

  resume = () => {
    this.ac.resume()
    this.visualize()
  }

  stop = () => {
    this.abort()
    this.ac.close()
    window.cancelAnimationFrame(this.rafId)
  }
}
