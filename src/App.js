import React from 'react'
import load from 'audio-loader'
import WebAudioScheduler from 'web-audio-scheduler'
import './app.css'

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

let secondsPerBeat = 60.0 / 100
let p1L = secondsPerBeat * 24
let p2L = secondsPerBeat * 48

let wavs = ['water', 'weeds']

let V = props =>
  <video autoPlay loop className="video-background" muted playsInline>
    <source src={props.src} />
  </video>

export default class extends React.Component {
  state = {
    loading: true,
    buffers: [],
    vid: null
  }
  async componentDidMount() {
    let buffers = await Promise.all(
      wavs.map(x => load(process.env.PUBLIC_URL + `/${x}.wav`))
    )
    let v = await fetch(process.env.PUBLIC_URL + `/water.mov`).then(r =>
      r.blob()
    )
    let vid = URL.createObjectURL(v)
    this.setState({ buffers, loading: false, vid })
  }
  song = e => {
    let t0 = e.playbackTime
    sched.insert(t0 + 0.0, e => this.section(e, 0))
    sched.insert(t0 + p1L, e => this.section(e, 1))
    sched.insert(t0 + p1L + p2L, e => this.section(e, 0))
  }
  section = (e, p) => {
    let t0 = e.playbackTime
    let amp = ctx.createGain()
    let source = ctx.createBufferSource()
    source.buffer = this.state.buffers[p]
    source.connect(ctx.destination)
    source.start(t0)
    amp.connect(masterGain)
  }
  render() {
    return (
      <div>
        {this.state.loading ? 'loading' : ''}
        <button onClick={() => sched.start(this.song)}>start</button>
        <button onClick={() => sched.stop(true)}>stop</button>
        {this.state.vid && <V src={this.state.vid} />}
      </div>
    )
  }
}
