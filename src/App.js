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
          <source src="https://r2---sn-tt1e7n7l.c.drive.google.com/videoplayback?id=f3e20381082f68b8&itag=18&source=webdrive&requiressl=yes&mm=30&mn=sn-tt1e7n7l&ms=nxu&mv=m&pl=17&sc=yes&ttl=transient&ei=1lqBWZm1E8K0ugLXsZvACg&susci=o-AFt6G7bCDBAz0ChU7rmfMVzDRfOE_6rnt6BagrExTWzOqjI&driveid=0B-jmbGSNcVIWcTc4anRMeW8yMW8&app=explorer&mime=video/mp4&lmt=1501649549759432&mt=1501649510&ip=23.233.64.137&ipbits=0&expire=1501653222&cp=QVNFU0dfUlJQQ1hOOmgxWkk0QWxOcHRW&sparams=ip,ipbits,expire,id,itag,source,requiressl,mm,mn,ms,mv,pl,sc,ttl,ei,susci,driveid,app,mime,lmt,cp&signature=432F3953464C7C518E30BF9E904AAF8A7D58AAE3.21B032052C1839C1C15BFAB2D657396A042FF040&key=ck2&cpn=9NpkrWTkaYqyM_7_&c=WEB&cver=1.20170731" />
        </video>
      </div>
    )
  }
}
