import React from 'react'
import load from 'audio-loader'
import './app.css'

let L = p =>
  <div>
    {p.on ? 'X' : 'O'}
  </div>

let ctx = new AudioContext()

export default class extends React.Component {
  state = { p1: null }
  componentDidMount() {
    load(process.env.PUBLIC_URL + '/a1.wav').then(p1 =>
      this.setState({ p1 }, this.play)
    )
  }
  play = () => {
    if (this.state.p1) {
      let source = ctx.createBufferSource()
      source.buffer = this.state.p1
      source.connect(ctx.destination)
      source.loop = true
      source.start()
    }
  }
  render() {
    return (
      <div>
        <video autoPlay loop id="video-background" muted playsInline>
          <source src={process.env.PUBLIC_URL + '/Untitled.mov'} />
        </video>
      </div>
    )
  }
}
