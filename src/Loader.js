import React from 'react'
import { MoonLoader } from 'halogen'
import './app.css'

let style = loading => ({
  display: 'flex',
  WebkitFlex: '0 1 auto',
  flex: '0 1 auto',
  WebkitFlexDirection: 'column',
  flexDirection: 'column',
  WebkitFlexGrow: 1,
  flexGrow: 1,
  WebkitFlexShrink: 0,
  flexShrink: 0,
  WebkitFlexBasis: '25%',
  flexBasis: '25%',
  position: 'absolute',
  width: '100vw',
  height: '100vh',
  margin: '0 auto',
  WebkitAlignItems: 'center',
  alignItems: 'center',
  WebkitJustifyContent: 'center',
  justifyContent: 'center',
  transition: 'opacity 0.2s ease',
  opacity: loading ? 1 : 0,
  pointerEvents: 'none'
})

export default ({ loading }) =>
  <div style={style(loading)}>
    <MoonLoader />
  </div>
