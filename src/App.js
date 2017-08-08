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

let V = props =>
  <video autoPlay loop className="video-background" muted playsInline>
    <source src={props.src} />
  </video>

export default class extends React.Component {
  state = {
    loading: true,
    buffers: [],
    vid: null,
    current: 0,
    transition: false,
    step: 0,
    beat: 0
  }
  async componentDidMount() {
    let buffers = await Promise.all([
      load(process.env.PUBLIC_URL + `/s1.wav`),
      load(process.env.PUBLIC_URL + `/s1t.wav`),
      load(process.env.PUBLIC_URL + `/weeds.wav`)
    ])
    // let v = await fetch(process.env.PUBLIC_URL + `/water.mov`).then(r =>
    //   r.blob()
    // )
    // let vid = URL.createObjectURL(v)
    // this.setState({ buffers, loading: false, vid })
    this.setState({ buffers, loading: false })
  }
  song = e => {
    let t0 = e.playbackTime

    sched.insert(t0, e => this.section(e, this.state.step, this.state.beat))
    sched.insert(t0 + secondsPerBeat, this.song)

    if (this.state.transition && this.state.beat === 0) {
      this.setState({ transition: false, step: this.state.step + 1 })
      sched.insert(t0 + secondsPerBeat * 11.5, () =>
        this.setState({ step: this.state.step + 1 })
      )
    }
  }
  section = (e, step, beat) => {
    let offset = secondsPerBeat * beat
    let t0 = e.playbackTime
    let t1 = e.playbackTime + secondsPerBeat

    let amp = ctx.createGain()
    let source = ctx.createBufferSource()
    source.buffer = this.state.buffers[step]
    source.connect(ctx.destination)
    source.start(t0, offset)
    source.stop(t1)
    amp.connect(masterGain)

    this.setState({ beat: (beat + 1) % 12 })
  }
  render() {
    return (
      <div>
        <h1>
          {this.state.beat % 6}
        </h1>
        {this.state.loading ? 'loading' : ''}
        <button onClick={() => sched.start(this.song)}>start</button>
        <button onClick={() => sched.stop(true)}>stop</button>
        {!this.state.transition &&
          <button onClick={() => this.setState({ transition: true })}>
            transition
          </button>}
        {this.state.transition && <span>transitionining</span>}
        {/* {this.state.vid && <V src={this.state.vid} />} */}
      </div>
    )
  }
}
