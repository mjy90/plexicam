import { DEBUG } from './constants.js'

export function webgazerInit(gazeListener) {
  // Register WebGazer event handlers
  window.onbeforeunload = () => {
    webgazer.end()
  }
  webgazer.setRegression('ridge') /* currently must set regression and tracker */
    // .setTracker('clmtrackr')
    // .setTracker('js_objectdetect')
    // .setTracker('trackingjs')
    .setTracker('TFFacemesh')

  if (gazeListener)
    webgazer.setGazeListener(gazeListener)

  webgazer.saveDataAcrossSessions(true)
    .begin()

  // Set video feed to invisible canvas so we can use it later
  const hiddenFeedCanvas = document.createElement('canvas')
  hiddenFeedCanvas.addEventListener('load', () => {
    const ctx = hiddenFeedCanvas.getContext('2d')
    // ctx.scale(-1, 1)
    // ctx.save()
    webgazer.setVideoElementCanvas(hiddenFeedCanvas)
  })

  // Turn off video preview and predictions. We'll implement those manually.
  webgazer.showVideoPreview(false)
    .showPredictionPoints(DEBUG)
    .applyKalmanFilter(true)
}

// export function getWebgazerCanvas() {
//   // return webgazerCanvas// && webgazerCanvas.toDataURL("image/png").split(",")[1]
//   return webgazer.getWebgazerCanvas()
// }

var gazeRollingHistory = []
export function filteredGaze(gaze) {
  if (!(gaze?.x && gaze?.y)) return null

  gazeRollingHistory.push(gaze)
  if (gazeRollingHistory.length > 20) { // Only keep the last few gazes
    gazeRollingHistory.shift()
  }

  const sums = gazeRollingHistory.reduce((acc, curr) => {
      acc.x += curr.x
      acc.y += curr.y
      return acc
    },
    { x: 0, y: 0 }
  )


  return {
    x: sums.x / gazeRollingHistory.length,
    y: sums.y / gazeRollingHistory.length,
  }
}
