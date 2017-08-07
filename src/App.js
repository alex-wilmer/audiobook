import React from 'react'
import load from 'audio-loader'
import WebAudioScheduler from 'web-audio-scheduler'
import './app.css'

let L = p =>
  <div>
    {p.on ? 'X' : 'O'}
  </div>

let ctx = new AudioContext()
let sched = new WebAudioScheduler({ context: ctx })
let masterGain = null

sched.on('start', () => {
  masterGain = ctx.createGain()
  masterGain.connect(ctx.destination)
})

sched.on('stop', () => {
  masterGain.disconnect()
  masterGain = null
})

var secondsPerBeat = 60.0 / 100

export default class extends React.Component {
  state = { p1: null }
  componentDidMount() {
    load(process.env.PUBLIC_URL + '/water.wav').then(p1 =>
      this.setState({ p1 })
    )
  }
  song = e => {
    const t0 = e.playbackTime

    sched.insert(t0 + 0.0, this.section)
    sched.insert(t0 + secondsPerBeat * 24, this.song)
  }
  section = e => {
    const t0 = e.playbackTime
    const amp = ctx.createGain()

    let source = ctx.createBufferSource()
    source.buffer = this.state.p1
    source.connect(ctx.destination)
    source.start(t0)

    // amp.gain.setValueAtTime(0.5, t0);
    // amp.gain.exponentialRampToValueAtTime(1e-6, t1);
    amp.connect(masterGain)
  }

  render() {
    return (
      <div>
        <button onClick={() => sched.start(this.song)}>start</button>
        <button onClick={() => sched.stop(true)}>stop</button>
      </div>
    )
  }
}
