import React from 'react'
import load from 'audio-loader'
import WebAudioScheduler from 'web-audio-scheduler'
import Loader from './Loader'
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

class V extends React.Component {
  el = null
  componentWillReceiveProps(next) {
    if (this.props.src !== next.src) {
      this.el.load()
      this.el.play()
    }
  }
  render() {
    return (
      <video
        ref={el => (this.el = el)}
        autoPlay
        loop
        className="video-background"
        muted
        playsInline
      >
        <source src={this.props.src} />
      </video>
    )
  }
}

export default class extends React.Component {
  state = {
    loading: true,
    buffers: [],
    vids: [],
    current: 0,
    transition: false,
    step: -1,
    beat: 0
  }
  async componentDidMount() {
    let buffers = await Promise.all([
      load(process.env.PUBLIC_URL + `/s1.wav`),
      load(process.env.PUBLIC_URL + `/s1t.wav`),
      load(process.env.PUBLIC_URL + `/s2.wav`),
      load(process.env.PUBLIC_URL + `/s2t.wav`),
      load(process.env.PUBLIC_URL + `/s3.wav`),
      load(process.env.PUBLIC_URL + `/s3t.wav`),
      load(process.env.PUBLIC_URL + `/s4.wav`),
      load(process.env.PUBLIC_URL + `/s4.wav`)
    ])
    let vids = await Promise.all([
      fetch(process.env.PUBLIC_URL + `/water.mov`)
        .then(r => r.blob())
        .then(v => URL.createObjectURL(v)),
      fetch(process.env.PUBLIC_URL + `/water.mov`)
        .then(r => r.blob())
        .then(v => URL.createObjectURL(v)),
      fetch(process.env.PUBLIC_URL + `/weeds.mov`)
        .then(r => r.blob())
        .then(v => URL.createObjectURL(v)),
      fetch(process.env.PUBLIC_URL + `/weeds.mov`)
        .then(r => r.blob())
        .then(v => URL.createObjectURL(v)),
      fetch(process.env.PUBLIC_URL + `/ice.mov`)
        .then(r => r.blob())
        .then(v => URL.createObjectURL(v)),
      fetch(process.env.PUBLIC_URL + `/ice.mov`)
        .then(r => r.blob())
        .then(v => URL.createObjectURL(v)),
      fetch(process.env.PUBLIC_URL + `/dimension.mov`)
        .then(r => r.blob())
        .then(v => URL.createObjectURL(v))
    ])
    this.setState({ buffers, vids, loading: false })
  }
  song = e => {
    let t0 = e.playbackTime

    sched.insert(t0, e => this.section(e, this.state.step, this.state.beat))
    sched.insert(t0 + secondsPerBeat, this.song)

    if (this.state.transition && this.state.beat === 0) {
      this.setState({ transition: false, step: (this.state.step + 1) % 8 })
      sched.insert(t0 + secondsPerBeat * 11.5, () =>
        this.setState({ step: (this.state.step + 1) % 8, loading: false })
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
      <div
        className="root"
        onClick={() => {
          if (this.state.step > -1) {
            this.setState({ transition: true, loading: true })
          }
        }}
      >
        <Loader loading={this.state.loading} />
        {!this.state.loading &&
          this.state.step === -1 &&
          <div className="container">
            <div className="title">AUDIOGRAMS</div>
            <div
              className="title play"
              onClick={() =>
                this.setState({ step: 0 }, () => sched.start(this.song))}
            >
              PLAY
            </div>
            <div className="title info">CLICK TO CYCLE THROUGH AUDIOGRAMS</div>
          </div>}
        {this.state.step > -1 && <V src={this.state.vids[this.state.step]} />}
      </div>
    )
  }
}
