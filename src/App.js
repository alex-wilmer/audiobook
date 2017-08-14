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

let grams = ['water', 'weeds', 'ice', 'dimension', 'gears', 'nails']

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
    let buffers = await Promise.all(
      grams.reduce(
        (p, c) => [
          ...p,
          load(process.env.PUBLIC_URL + `/${c}.wav`),
          load(process.env.PUBLIC_URL + `/${c}_ft.wav`)
        ],
        []
      )
    )
    let vids = await Promise.all(
      grams.reduce(
        (p, c) => [
          ...p,
          fetch(process.env.PUBLIC_URL + `/${c}.mov`)
            .then(r => r.blob())
            .then(v => URL.createObjectURL(v))
        ],
        []
      )
    )

    this.setState({ buffers, vids, loading: false })
  }
  song = e => {
    let t0 = e.playbackTime

    sched.insert(t0, e => this.section(e, this.state.step, this.state.beat))
    sched.insert(t0 + secondsPerBeat, this.song)

    if (this.state.transition && this.state.beat === 0) {
      this.setState({
        transition: false,
        step: (this.state.step + 1) % this.state.buffers.length
      })
      sched.insert(
        t0 + secondsPerBeat * (this.state.step < 8 ? 11.5 : 23.5),
        () =>
          this.setState({
            step: (this.state.step + 1) % this.state.buffers.length,
            loading: false
          })
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

    this.setState({ beat: (beat + 1) % (step < 8 ? 12 : 24) })
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
            <a href="https://github.com/alex-wilmer/audiobook" target="_blank">
              <i className="fa fa-github" />
            </a>
            <div className="title logo">AUDIOGRAMS</div>
            <div
              className="title info"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-around'
              }}
            >
              <div
                className="preview all"
                onClick={() =>
                  this.setState({ step: 0 }, () => sched.start(this.song))}
              >
                <video autoPlay loop muted playsInline />
                PLAY ALL
              </div>
              {grams.map((x, i) =>
                <div
                  className="preview"
                  key={x}
                  onClick={() =>
                    this.setState({ step: i * 2 }, () =>
                      sched.start(this.song)
                    )}
                >
                  <video autoPlay loop muted playsInline>
                    <source src={this.state.vids[i]} />
                  </video>
                  {x.toUpperCase()}
                </div>
              )}
            </div>
          </div>}
        {this.state.step > -1 &&
          <div
            className="header"
            onClick={e => {
              e.stopPropagation()
              this.setState({ step: -1 }, () => sched.stop(true))
            }}
          >
            <div style={{ paddingLeft: '10px' }}>
              <span
                style={{ transform: 'rotate(180deg)', display: 'inline-block' }}
              >
                ➦
              </span>{' '}
              BACK TO MENU
            </div>
            <div
              style={{
                marginLeft: 'auto',
                paddingRight: '10px',
                color: 'rgb(243, 255, 23)'
              }}
            >
              CLICK ON VIDEO TO BEGIN TRANSITION TO NEXT GRAM
            </div>
          </div>}
        {this.state.step > -1 &&
          <V src={this.state.vids[~~(this.state.step / 2)]} />}
      </div>
    )
  }
}
