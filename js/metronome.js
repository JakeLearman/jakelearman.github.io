const context = new AudioContext()
const bpm = 140.0
let beatNumber = 0
let nextBeatTime = 0.0
const play = () => {
  nextBeatTime = context.currentTime
  scheduler()
}

const scheduler = () => {
   const secondsPerBeat = 60.0 / bpm
   const lookahead = 0.1
  
   while (nextBeatTime < context.currentTime + lookahead) {
     beep(beatNumber, nextBeatTime)
     nextBeatTime += secondsPerBeat
     beatNumber += 1
   }
 
   setTimeout(scheduler, 0.25)
 }

 const beep = (beat, time) => {
   const beepLength = 0.05
   const osc = context.createOscillator()
   osc.connect(context.destination)
   if (beat % 16 === 0) {
     osc.frequency.value = 880.0 
     console.log('beep:start')
   } else if (beat % 4 === 0) {
     osc.frequency.value = 440.0
     console.log('beep:bar')
   } else {
     osc.frequency.value = 220.0 /
     console.log('beep:beat')
   }
   osc.start(time)
   osc.stop(time + beepLength)
 } 
 
 play()