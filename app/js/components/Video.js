'use strict'

import React from 'react'

const log = window.require('./log')
const config = window.require('./config')

class Video extends React.Component {
	constructor(props) {
		super(props)
		document.onkeypress = this.handleKeyPress
		this.state = {
			capCount: 0,
			capString: ''
		}
	}
  componentDidMount() {
		if (!config.readConfig('video')) {
			this.initConfig()
		}

		const textTrack = document.querySelector('video').textTracks[0]
		const cap = document.querySelector('#cap')
		const that = this
		textTrack.oncuechange = function () {
			const cue = this.activeCues[0]
			const capCount = that.state.capCount
			if (capCount == 2) {
				that.setState({capCount: 0})
				that.setState({capString: ''})
			}
			if (cue) {
				console.log('Active cue:', cue.startTime, cue.endTime, cue.text)
				const lastCap = that.state.capString
				const separator = '　'
				let capString
				if (lastCap) {
					capString = lastCap + separator + cue.text
					that.setState({capCount: capCount + 1})
				} else {
					capString = cue.text
				}
				that.setState({capString: capString})
			} else {
				console.log('No cue')
				that.setState({capCount: 0})
				that.setState({capString: ''})
			}
		}
  }
	initConfig() {
		config.saveConfig('name', 'Polaris')
		config.saveConfig('video', 'Dolphins')
		config.saveConfig('speed', 'slow')
		config.saveConfig('caption', 'less')
		config.saveConfig('captionError', 'less')
		const errors = [ '3-2', '5-1', '6-1' ]
		config.saveConfig('errors', errors)
	}
  handleKeyPress = event => {
    const textTrack = document.querySelector('video').textTracks[0]
		const offset = 48

		let cue = textTrack.activeCues[0]
		let mark = 0
		if (cue) {
			let cueText = cue.text
      let texts = cueText.match(/^(.*?)\s{4}(.*?)\s{4}(.*?)$/)
			if (texts == null) {
				texts = cueText.match(/^(.*?)\s{4}(.*?)$/)
			}
			if (texts == null) {
				texts = cueText.match(/^(.*?)$/)
			}

			let index = event.keyCode - offset
			let focusText = texts[index].match(/<c\.n1>(.*?)<\/c>/)
			let newFocusText
			if (focusText) {
				newFocusText = focusText[1]
				mark = 0
			} else {
				newFocusText = `<c.n1>${texts[index]}</c>`
				mark = 1
			}
			cue.text = cueText.replace(texts[index], newFocusText)
			cue.align = 'start'
			cue.align = 'middle' // For force refresh

			const name = config.readConfig('name')
			const video = config.readConfig('video')
			const speed = config.readConfig('speed')
			const caption = config.readConfig('caption')
			const captionError = config.readConfig('captionError')

			const captionId = cue.id
			const captionStartTime = cue.startTime
			const captionSection = `${cue.id}-${index}`
			const sectionWithError = config.hasError(captionSection)
			const markDone = mark
			const markTime = document.querySelector('video').currentTime - cue.startTime

			const logContent = `${name}|${video}|${speed}|${caption}|${captionError}|${captionId}|${captionStartTime}|${captionSection}|${sectionWithError}|${markDone}|${markTime}`
      log.append(logContent)

			console.log('Marked', logContent)
		} else {
			console.log('Not marked')
		}
	}
	render() {
		return (
      <figure id="videoContainer">
         <video id="video" controls preload="metadata" poster="img/poster.png">
            <source src="videos/sample.mp4" type="video/mp4" />
            <track label="Appended" kind="subtitles" srcLang="zh" src="captions/vtt/sample-appended.vtt" default />
            <track label="Spaced" kind="subtitles" srcLang="zh" src="captions/vtt/sample-spaced.vtt" />
            <track label="Plain" kind="subtitles" srcLang="zh" src="captions/vtt/sample.vtt" />
            <track label="Split" kind="subtitles" srcLang="zh" src="captions/vtt/sample-split.vtt" />
         </video>
         <div id="cap">{this.state.capString}</div>
      </figure>
		)
	}
}

export default Video
