import { colors } from './constants.js'
import { removeMacro } from './macros.js'

export function preloadAsset(object, callback) {
  let element

  if (['.mov', '.mp4'].some((ext) => object.src?.endsWith(ext))) {
    element = document.createElement('video')
    element.style = 'position: absolute; top: 0; left: 0; z-index: -1; opacity: 0%;' // Tuck it behind the canvas and make it transparent
    element.width = object.width
    element.height = object.height
    element.autoplay = true
    element.loop = true
    element.muted = true

    let source = document.createElement('source')
    const extensions = object.src.split('.')
    source.src = object.src
    source.type = `video/${extensions[extensions.length - 1]}`

    element.appendChild(source)
    element.addEventListener('loadstart', callback) // Note when the video loads
    document.querySelector('div#plexicam-demo-container').appendChild(element)
  }
  else if (object.src) {
    element = document.createElement('img')
    element.src = object.src
    element.addEventListener('load', callback) // Note when the image loads
  }
  else if (typeof(object.getElement) === 'function') {
    element = object.getElement()
    if (typeof(callback) === 'function') callback()
  }
  else if (typeof(callback) === 'function') {
    callback()
  }

  object.element = element
}

export function getGroupedObjects(objects, { object=null, groupName=null, includeSelf=false }) {
  const defaultGroup = includeSelf ? [object] : []
  const group = groupName || object.group?.name

  return group
    ? objects.filter((o) => o.group?.name === group && (includeSelf || o.id !== object?.id))
    : defaultGroup
}

export function drawTargetCircle(object, context) {
  const { x, y, width, pending } = object
  const radius = width / 2

  context.fillStyle = pending ? colors.closeBtn : colors.maximizeBtn
  context.globalAlpha = object.opacity || .5
  context.beginPath()
  context.arc(x + radius, y + radius, radius, 0, 2 * Math.PI)
  context.fill()
  context.globalAlpha = 1
}

