import {
  DEBUG,
  ROOT_URL,
  WALLPAPER,
  WALLPAPER_Z,
  MAX_WINDOW_Z,
  DESKTOP_GROUP,
  DOCK,
  DOCK_Z,
  PLEXICAM_Z,
  MEETING_GROUP,
  FULLSCREEN_BUTTON,
  FULLSCREEN_DOCK_BUTTON,
  ENTER_FULLSCREEN_ICON,
  EXIT_FULLSCREEN_ICON,
  EYE_TRACKING_BUTTON,
  WINDOW_MANAGER_HEIGHT,
  DOCK_HEIGHT,
  FONT_SIZE,
  LINE_HEIGHT,
  MARGIN,
  BUTTON_HEIGHT,
  BUTTON_RADIUS,
  MAX_OFFSCREEN_DISTANCE,
  TYPES,
  SCREEN_SIZE_SETTING,
  SCREEN_TYPE_SETTING,
  BULLSEYE_DISPLAY_SETTING,
  GAZE_INDICATOR,
  booleanOptions,
  screenSizes,
  screenTypes,
  colors,
  TELEPROMPTER_SCRIPT,
  FRAME_RATE,
} from './constants.js'
import {
  PLEXICAM_PRO,
  BULLSEYE,
  // WEBGAZER,
  GAZE_TARGETS,
  addMacro,
  removeMacro,
  swapMacro,
} from './objectMacros.js'
import {
  drawButton,
  drawDropdown,
  drawDropdownOption,
  drawWindowManager,
  drawDock,
  drawDebugInfo,
  formatTextForArea,
  drawScrollingText,
} from './ui.js'
import {
  preloadAsset,
  getGroupedObjects,
} from './helpers.js'
import { filteredGaze, webgazerInit } from './webgazer.js'

// Globals
var container
var canvas
var context
var boundingBox
var offsetX
var offsetY
var mouseX
var mouseY
var fullscreen = false
var ppi = 96
var screenSize
var isHiDpiDisplay = window.devicePixelRatio >= 2
var webgazerInitialized = false
var webgazerCalibrated = false
var webgazerRunning = false

// Scene objects
var objects = [
  {
    id: WALLPAPER,
    // src: `${ROOT_URL}/assets/images/Mountains 4k.jpeg`,
    src: 'https://cdn.shopify.com/s/files/1/0576/0496/4404/files/simulation-wallpaper.jpg',
    x: 0, y: 0, z: WALLPAPER_Z,
    group: {
      name: DESKTOP_GROUP,
    },
  },
  // {
  //   id: DOCK,
  //   z: DOCK_Z,
  //   height: DOCK_HEIGHT,
  //   group: {
  //     name: DESKTOP_GROUP,
  //     offset: { left: 0, bottom: 0 }
  //   },
  // },
  // {
  //   id: FULLSCREEN_DOCK_BUTTON,
  //   src: ENTER_FULLSCREEN_ICON,
  //   z: DOCK_Z + 1,
  //   width: DOCK_HEIGHT, height: DOCK_HEIGHT,
  //   group: {
  //     name: DESKTOP_GROUP,
  //     offset: { right: 0, bottom: 0 }
  //   },
  //   onClick: toggleFullscreen,
  // },
  ...PLEXICAM_PRO,
  {
    id: 'webcam',
    src: `${ROOT_URL}/assets/images/Webcam.png`,
    z: PLEXICAM_Z + 4,
    widthInches: 3.6875, heightInches: 1.65625, // inches
    group: {
      name: 'plexicam',
      centered: true,
      offset: { top: 2.825 },
    },
    mobility: ['x', 'y'],
  },
  {
    id: 'meeting',
    // src: `${ROOT_URL}/assets/videos/Model w_plexicam.mp4`,
    src: `${ROOT_URL}/assets/videos/Model with PlexiCam color-corrected 15s.mp4`,
    x: 40, y: 55, z: 3,
    width: 640, height: 360,
    mobility: ['x', 'y'],
    renderWindowManager: true,
    windowTitle: "Person You're Talking To",
    group: { name: MEETING_GROUP },
  },
  // {
  //   id: 'interview questions',
  //   src: `${ROOT_URL}/assets/images/Interview Questions.png`,
  //   x: 845, y: 130, z: 5,
  //   width: 350, height: 450,
  //   mobility: ['x', 'y'],
  //   renderWindowManager: true,
  //   windowTitle: 'Interview Questions',
  // },
  // {
  //   id: 'teleprompter_old',
  //   src: `${ROOT_URL}/assets/videos/PlexiCam Teleprompter.mp4`,
  //   x: 300, y: 455, z: 4,
  //   width: 300, height: 400,
  //   mobility: ['x', 'y'],
  //   renderWindowManager: true,
  //   windowTitle: 'Your Script',
  // },
  {
    id: 'teleprompter',
    // src: `${ROOT_URL}/assets/videos/PlexiCam Teleprompter.mp4`,
    initialized: false,
    init: setTeleprompterText,
    draw: drawScrollingText,
    x: 750, y: 55, z: 4,
    width: 640, height: 720,
    mobility: ['x', 'y'],
    renderWindowManager: true,
    windowTitle: 'Your Script',
    text: TELEPROMPTER_SCRIPT,
  },
  {
    id: 'settings',
    src: `${ROOT_URL}/assets/images/Settings Window - Simplified.png`,
    x: 568, y: 160, z: 5,
    width: 450, height: 500,
    group: {
      name: 'settings',
    },
    mobility: ['x', 'y'],
    renderWindowManager: true,
    windowTitle: 'Simulation Settings',
  },
  {
    id: FULLSCREEN_BUTTON,
    type: TYPES.button,
    text: 'Enter Fullscreen',
    x: 585, y: 263, z: 5.1,
    width: 150, height: BUTTON_HEIGHT,
    group: {
      name: 'settings',
    },
    mobility: ['x', 'y'],
    onClick: toggleFullscreen,
  },
  {
    id: SCREEN_SIZE_SETTING,
    type: TYPES.dropdown,
    value: null,
    options: screenSizes,
    defaultText: 'Select screen size',
    onChange: screenSizeSelected,
    x: 585, y: 315, z: 5.3,
    width: 150, height: BUTTON_HEIGHT,
    group: {
      name: 'settings',
    },
    mobility: ['x', 'y'],
  },
  {
    id: SCREEN_TYPE_SETTING,
    type: TYPES.dropdown,
    value: screenTypes.find(sts => sts.value === isHiDpiDisplay).text,
    options: screenTypes,
    onChange: screenTypeSelected,
    x: 585, y: 367, z: 5.2,
    width: 150, height: BUTTON_HEIGHT,
    group: {
      name: 'settings',
    },
    mobility: ['x', 'y'],
  },
  {
    id: 'store button',
    type: TYPES.invisibleButton,
    x: 700, y: 458, z: 5.1,
    width: 175, height: LINE_HEIGHT,
    group: {
      name: 'settings',
    },
    mobility: ['x', 'y'],
    onClick: goToStore,
  },
  {
    id: BULLSEYE_DISPLAY_SETTING,
    type: TYPES.dropdown,
    value: 'Off',
    options: booleanOptions,
    onChange: bullseyeDisplaySelected,
    x: 585, y: 631, z: 5.1,
    width: 150, height: BUTTON_HEIGHT,
    group: {
      name: 'settings',
    },
    mobility: ['x', 'y'],
  },
  // {
  //   id: EYE_TRACKING_BUTTON,
  //   type: TYPES.button,
  //   color: colors.btn,
  //   text: 'Start eye-tracking',
  //   x: 750, y: 734, z: 5.1,
  //   width: 141, height: BUTTON_HEIGHT,
  //   group: {
  //     name: 'settings',
  //   },
  //   mobility: ['x', 'y'],
  //   onClick: toggleGazeHandler,
  // },
]

// State
const objectsToLoadCount = objects.filter(o => o.src).length
var objectLoadedCount = 0
var dragging = false
var startX
var startY
var screenSize

// Call init() once all assets are loaded
const initIfAllLoaded = () => {
  objectLoadedCount++
  if (objectLoadedCount === objectsToLoadCount)
    init()
}

// Preload all assets
window.addEventListener('load', () => {
  // Load all the object images
  for (let object of objects) {
    preloadAsset(object, initIfAllLoaded)
  }
})

// Initialize globals and draw the scene
function init() {
  container = document.getElementById('plexicam-demo-container')
  // Initialize canvas
  canvas = document.createElement('canvas')
  canvas.id = 'demo'
  canvas.width = 1280
  canvas.height = 720
  // Throw it in the container
  container.appendChild(canvas)
  // Grab its context
  context = canvas.getContext('2d')

  // Prep canvas
  calculatePpi()
  getIsFullscreen()
  fitCanvasToContainer()

  // Prep objects
  createDummyGroups()
  createMaximizeButtons()
  sortObjects()
  calculateObjectSizes()
  assignRandomDebugColors()

  // Render at 30 FPS
  window.setInterval(draw, 1000 / FRAME_RATE)

  // Register mouse handlers last to be sure the user knows what they're clicking on
  canvas.onmousedown = mouseDown
  canvas.onmouseup = mouseUp
  canvas.onmousemove = mouseMove

  // Register fullscreen handlers
  canvas.addEventListener('fullscreenchange', fullscreenChanged)
  canvas.addEventListener('mozfullscreenchange', fullscreenChanged)
  canvas.addEventListener('msfullscreenchange', fullscreenChanged)
  canvas.addEventListener('webkitfullscreenchange', fullscreenChanged)
  document.addEventListener('fullscreenchange', fullscreenChanged)
  document.addEventListener('mozfullscreenchange', fullscreenChanged)
  document.addEventListener('msfullscreenchange', fullscreenChanged)
  document.addEventListener('webkitfullscreenchange', fullscreenChanged)

  // Register resize handler
  window.addEventListener('resize', onResize)
}

function fitCanvasToContainer() {
  boundingBox = canvas.getBoundingClientRect()
  offsetX = boundingBox.left
  offsetY = boundingBox.top

  if (fullscreen) {
    canvas.width = window.screen.width
    canvas.height = window.screen.height
  }
  else {
    // Set canvas to width of containing div, and a height that makes it 16:9
    canvas.width = container.clientWidth
    canvas.height = container.clientWidth / 16 * 9
  }

  resizeWallpaper()
}

function sortObjects() {
  objects.sort((a, b) => a.z - b.z)
}

// Clear the canvas
function clear() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

// Draw the scene
function draw() {
  clear()

  for (let object of objects) {
    let { x, y, width, height, mirror, initialized = true, init } = object

    if (!initialized && typeof (init) === 'function') {
      init(object)
      object.initialized = initialized = true
    }

    // Determine position based on whether it's mirrored
    if (mirror) {
      x = -x - width
      context.save()
      context.scale(-1, 1)
    }

    if (object.element) {
      context.drawImage(object.element, x, y, width, height)
    }
    else if (typeof (object.getElement) === 'function') {
      object.element = object.getElement()
      if (object.element) {
        context.drawImage(object.element, x, y, width, height)
      }
    }
    else if (typeof (object.draw) === 'function') {
      object.draw(context, object)
    }
    else if (object.type === TYPES.button) {
      drawButton(context, object)
    }
    else if (object.type === TYPES.dropdown) {
      drawDropdown(context, object)
    }
    else if (object.type === TYPES.dropdownOption) {
      drawDropdownOption(context, object)
    }
    // else if (object.type === TYPES.scrollingText) {
    //   drawScrollingText(context, object)
    // }

    if (mirror) {
      context.restore()
    }

    if (object.renderWindowManager) {
      drawWindowManager(context, object)
    }
    if (object.id === DOCK) {
      drawDock(context)
    }
    if (DEBUG) {
      drawDebugInfo(context, mouseX, mouseY, object)
    }
  }

  if (DEBUG) {
    drawDebugInfo(context, mouseX, mouseY)
  }
}

//////////////////
// Event-handlers

function mouseDown(e) {
  e.preventDefault()
  e.stopPropagation()

  // Get the current canvas position
  boundingBox = canvas.getBoundingClientRect()
  offsetX = boundingBox.left
  offsetY = boundingBox.top

  // Get the current mouse position
  const mouseX = parseInt(e.clientX - offsetX)
  const mouseY = parseInt(e.clientY - offsetY)
  dragging = false

  // Find the object with the highest Z index that the mouse is over
  const objectsUnderMouse = objects.filter((object) => {
    const { ignoreClick } = object
    const top = object.renderWindowManager ? object.y - WINDOW_MANAGER_HEIGHT : object.y
    const bottom = object.y + object.height
    const left = object.x
    const right = object.x + object.width

    return !ignoreClick && mouseX > left && mouseX < right && mouseY > top && mouseY < bottom
  })

  // If an object is under the mouse, start dragging the item with the highest Z index
  if (objectsUnderMouse.length) {
    const highestObject = objectsUnderMouse.pop()
    const highestObjectIndex = objects.findIndex((o) => o.id === highestObject.id)
    const object = objects[highestObjectIndex]

    if (object.onClick) {
      object.onClick(object, objects)
      return
    }
    // If it's a dropdown, expand it and don't start dragging
    if (object.type === TYPES.dropdown) {
      bringWindowToFront(object)
      dropdownClicked(object)
      return
    }
    // If it's a dropdown option, collapse its dropdown and don't start dragging
    if (object.type === TYPES.dropdownOption) {
      collapseDropdown(object.dropdown)
      object.dropdown.onChange(object)
      return
    }

    // Set dragging states
    dragging = true
    object.isDragging = true

    // Save the current mouse position
    startX = mouseX
    startY = mouseY

    // If we're dragging an item on the simulated desktop,
    // bring it to the front, along with grouped objects.
    if (WALLPAPER_Z < object.z && object.z <= MAX_WINDOW_Z)
      bringWindowToFront(object)
  }

  // Something other than a dropdown clicked. Close any open dropdowns.
  const openDropdown = objects.find(o => o.type === TYPES.dropdown && o.expanded)
  if (openDropdown) {
    openDropdown.expanded = false
    collapseDropdown(openDropdown)
  }
}

function mouseUp(e) {
  e.preventDefault()
  e.stopPropagation()

  // Clear all the dragging flags
  dragging = false
  objects.forEach((object) => object.isDragging = false)
}

function mouseMove(e) {
  e.preventDefault()
  e.stopPropagation()

  // Note the current mouse position
  mouseX = parseInt(e.clientX - offsetX)
  mouseY = parseInt(e.clientY - offsetY)

  // If we're dragging anything...
  if (dragging) {
    // Calculate the distance the mouse has moved
    const dx = mouseX - startX
    const dy = mouseY - startY

    // Find the object that isDragging and any grouped with it
    const draggedObject = objects.find((o) => o.isDragging)
    if (!draggedObject) return

    const groupedObjects = getGroupedObjects(objects, { object: draggedObject })
    const moveableInX = canMove(draggedObject, 'x', dx) && groupedObjects.every(o => withinConstraint(o, 'x', dx))
    const moveableInY = canMove(draggedObject, 'y', dy) && groupedObjects.every(o => withinConstraint(o, 'y', dy))

    if (moveableInX)
      draggedObject.x += dx
    if (moveableInY)
      draggedObject.y += dy

    for (let object of groupedObjects) {
      if (moveableInX && canMove(object, 'x', dx))
        object.x += dx
      if (moveableInY && canMove(object, 'y', dy))
        object.y += dy
    }

    // Reset the starting mouse position for the next mousemove
    startX = mouseX
    startY = mouseY
  }
}

function canMove(object, axis, delta) {
  const axisMobile = object.mobility && object.mobility.indexOf(axis) > -1

  return axisMobile && withinConstraint(object, axis, delta)
}

function withinConstraint(object, axis, delta) {
  const axisConstraint = object.constraints && object.constraints[axis]
  var meetsConstraint = true

  if (axisConstraint !== undefined) {
    const newSpot = object[axis] + delta
    meetsConstraint = newSpot > axisConstraint[0] * ppi && newSpot < axisConstraint[1] * ppi
  }

  return meetsConstraint
}

function dropdownClicked(dropdown) {
  if (!dropdown.type === TYPES.dropdown) return

  if (dropdown.expanded)
    collapseDropdown(dropdown)
  else
    expandDropdown(dropdown)
}

function expandDropdown(dropdown) {
  dropdown.expanded = true

  // Ensure the dropdown dropdown and items are grouped
  const groupName = dropdown.group?.name || `${dropdown.id}_grp`
  dropdown.group ||= { name: groupName }

  for (var i = 0; i < dropdown.options.length; i++) {
    let option = dropdown.options[i]

    objects.push({
      id: `${dropdown.id}_option_${option.value}`,
      type: TYPES.dropdownOption,
      dropdown: dropdown,
      x: dropdown.x,
      y: dropdown.y + ((i + 1) * LINE_HEIGHT),
      z: dropdown.z + 10,
      width: dropdown.width,
      height: LINE_HEIGHT,
      text: option.text,
      value: option.value,
      debugColor: randomColor(),
    })
  }

  sortObjects()
}

function collapseDropdown(dropdown) {
  dropdown.expanded = false

  // Remove all option objects belonging to this dropdown
  const dropdownOptions = objects.filter(o => (o.type === TYPES.dropdownOption && o.dropdown === dropdown.id))
  objects = objects.filter(o => !(o.type === TYPES.dropdownOption && o.dropdown.id === dropdown.id))
}

function screenSizeSelected(option) {
  const screenSizeSetting = objects.find(o => o.id === SCREEN_SIZE_SETTING)
  const optionValue = parseInt(option.value)
  screenSize = isNaN(optionValue) ? 15 : optionValue

  screenSizeSetting.value = option.text

  recalculateScreen()
}

function screenTypeSelected(option) {
  const screenTypeSetting = objects.find(o => o.id === SCREEN_TYPE_SETTING)

  screenTypeSetting.value = option.text
  isHiDpiDisplay = option.value

  recalculateScreen()
}

function goToStore() {
  window.open('https://beta.plexicam.com/collections', '_blank')
}

function bullseyeDisplaySelected(option) {
  const bullseyeDisplaySetting = objects.find(o => o.id === BULLSEYE_DISPLAY_SETTING)

  if (bullseyeDisplaySetting.value === option.text) return

  bullseyeDisplaySetting.value = option.text

  if (option.value)
    addMacro(objects, BULLSEYE, () => {
      sortObjects()
      recalculateScreen()
    })
  else
    removeMacro(objects, BULLSEYE)
}

function recalculateScreen() {
  calculatePpi()
  calculateObjectSizes()
}

// Determine pixels-per-inch, accounting for zoom and hi-DPI screens
function calculatePpi() {
  const zoomRatio = isHiDpiDisplay ? window.devicePixelRatio / 2 : window.devicePixelRatio

  if (screenSize) {
    ppi = Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / screenSize / zoomRatio
  }
  else {
    ppi = 96 / zoomRatio
  }
}

function toggleGazeHandler(e) {
  try {
    const eyeTrackingBtn = objects.find(o => o.id === EYE_TRACKING_BUTTON)

    if (webgazerRunning) {
      webgazer.pause()
      webgazerRunning = false
      eyeTrackingBtn.text = 'Resume eye-tracking'
      removeMacro(objects, WEBGAZER)
      // if (!webgazerCalibrated)
      //   removeMacro(objects, GAZE_TARGETS)
    }
    else {
      if (webgazerInitialized) {
        webgazer.resume()
        webgazerRunning = true
      }
      else {
        webgazerInit(gazeCollected)
        webgazerInitialized = true
        webgazerRunning = true
        addMacro(objects, GAZE_TARGETS, () => {
          sortObjects()
          recalculateScreen()
        })
      }
      eyeTrackingBtn.text = 'Pause eye-tracking'
      addMacro(objects, WEBGAZER, () => {
        sortObjects()
        recalculateScreen()
      })
      // if (!webgazerCalibrated) {
      //   addMacro(objects, GAZE_TARGETS, () => {
      //     sortObjects()
      //     recalculateScreen()
      //   })
      // }
    }
  }
  catch (e) {
    console.error(e)
    webgazerRunning = false
  }
}

var gazeCount = 0
function gazeCollected(data, clock) {
  // console.log(clock, data)
  gazeCount++
  if (gazeCount > 100) {
    gazeCount = 0
    console.log(clock, data)
  }

  const gaze = filteredGaze(data)
  if (!gaze) return

  const gazeIndicator = objects.find(o => o.id === GAZE_INDICATOR)
  gazeIndicator.x = gaze.x
  gazeIndicator.y = gaze.y
}

// End event-handlers
/////////////////////

////////////////
// Draw helpers

function createDummyGroups() {
  for (let object of objects.filter(o => !o.group))
    object.group = { name: object.id }
}

// Create invisible fullscreen toggle over the fake window manager's "maximize" button
function createMaximizeButtons() {
  for (let object of objects.filter(o => o.renderWindowManager))
    createMaximizeButton(object)
}

function setTeleprompterText(teleprompter) {
  console.log('setTeleprompterText')
  teleprompter.text = formatTextForArea(context, TELEPROMPTER_SCRIPT, teleprompter.width)
}

function createMaximizeButton(parentWindow) {
  const { id, x, y, z, group } = parentWindow
  const size = WINDOW_MANAGER_HEIGHT / 2
  const top = y - (.75 * WINDOW_MANAGER_HEIGHT)
  const left = x + (3.5 * size)

  objects.push({
    id: `${id} ${FULLSCREEN_BUTTON}`,
    type: TYPES.invisibleButton,
    x: left, y: top, z: z + .01,
    width: size, height: size,
    group,
    mobility: ['x', 'y'],
    onClick: toggleFullscreen,
  })
}

// Calculate the size in pixels of things defined in inches
function calculateObjectSizes() {
  // Resize wallpaper
  resizeWallpaper()

  // Scale dock virtual object
  const dock = objects.find(o => o.id === DOCK)
  if (dock) {
    dock.width = canvas.width
    dock.y = canvas.height - DOCK_HEIGHT
  }

  // Scale other objects
  const objectsNeedScaling = objects.filter(o => o.widthInches || o.heightInches)

  for (let object of objectsNeedScaling) {
    object.width = Math.round(object.widthInches * ppi)
    object.height = Math.round(object.heightInches * ppi)
  }

  // Now that all objects are scaled, we can find any that need repositioning within their group
  const objectsNeedRepositioning = objects.filter(o => o.group?.centered || o.group?.offset)
  const groupsNeedRepositioning = Array.from(new Set(objectsNeedRepositioning.map(o => o.group.name)))
  for (let group of groupsNeedRepositioning) {
    const groupedObjects = getGroupedObjects(objects, { groupName: group })

    const minXValues = groupedObjects.filter(o => o.x !== undefined && o.x >= -MAX_OFFSCREEN_DISTANCE)
      .map(o => o.x)
    const minX = minXValues.length ? Math.min(...minXValues) : 0
    const maxXValues = groupedObjects.filter(o => o.x !== undefined && o.x + (o.width || 0) <= canvas.width + MAX_OFFSCREEN_DISTANCE)
      .map(o => o.x + (o.width || 0))
    const maxX = maxXValues.length ? Math.max(...maxXValues) : canvas.width
    const centerX = (minX + maxX) / 2

    const minYValues = groupedObjects.filter(o => o.y !== undefined && o.y >= -MAX_OFFSCREEN_DISTANCE)
      .map(o => o.y)
    const minY = minYValues.length ? Math.min(...minYValues) : 0
    const maxYValues = groupedObjects.filter(o => o.y !== undefined && o.y + (o.height || 0) <= canvas.height + MAX_OFFSCREEN_DISTANCE)
      .map(o => o.y + (o.height || 0))
    const maxY = maxYValues.length ? Math.max(...maxYValues) : canvas.height
    const centerY = (minY + maxY) / 2

    for (let object of groupedObjects) {
      if (object.group.centered) {
        if (object.group.centered === true || object.group.centered === 'x' || object.group.centered === 'both')
          object.x = centerX - (object.width / 2)
        if (object.group.centered === 'y' || object.group.centered === 'both')
          object.y = centerY - (object.height / 2)
      }
      const offset = object.group.offset
      if (offset !== undefined) {
        if (offset.left !== undefined)
          object.x = minX + (offset.left * ppi)
        else if (offset.right !== undefined)
          object.x = maxX - (offset.right * ppi) - object.width

        if (offset.top !== undefined)
          object.y = minY + (offset.top * ppi)
        else if (offset.bottom !== undefined)
          object.y = maxY - (offset.bottom * ppi) - object.height
      }
    }
  }
}

function resizeWallpaper() {
  const wallpaper = objects.find(o => o.id === WALLPAPER)
  wallpaper.width = canvas.width
  wallpaper.height = canvas.height // / 16 * 9 // Maintain aspect ratio of wallpaper
}

function assignRandomDebugColors() {
  for (let object of objects)
    object.debugColor = randomColor()
}

function randomColor() {
  const hex = '0123456789ABCDEF'
  const hexColor = [...Array(6)].map(() => hex[Math.floor(Math.random() * 16)]).join('')
  return `#${hexColor}`
}

// End draw helpers
///////////////////

function bringWindowToFront(window) {
  const otherWindows = objects.filter(o =>
    WALLPAPER_Z < o.z && o.z <= MAX_WINDOW_Z && o.id !== window.id // Other window
    && (!o.group || o.group?.name !== window.group?.name) // Not in this group
  )

  otherWindows.forEach((other, i) => {
    // Reshuffle all the Z indexes. Windows are already sorted by Z.
    other.z = i + 1
  })

  // Set the Z indexes of the group to be on top
  var newZ = otherWindows.length + 1
  for (let groupie of getGroupedObjects(objects, { object: window, includeSelf: true })) {
    groupie.z = newZ
    newZ++
  }

  sortObjects()
}

function toggleFullscreen() {
  if (!fullscreen) {
    // Enter fullscreen!
    if (canvas.requestFullScreen)
      canvas.requestFullScreen()
    else if (canvas.webkitEnterFullScreen)
      canvas.webkitEnterFullScreen()
    else if (canvas.webkitRequestFullScreen)
      canvas.webkitRequestFullScreen()
    else if (canvas.mozRequestFullScreen)
      canvas.mozRequestFullScreen()
    else if (canvas.msRequestFullscreen)
      canvas.msRequestFullscreen()
  }
  else {
    // Exit fullscreen
    if (document.exitFullscreen)
      document.exitFullscreen()
    else if (document.webkitExitFullscreen)
      document.webkitExitFullscreen()
    else if (document.mozCancelFullScreen)
      document.mozCancelFullScreen()
    else if (document.msExitFullscreen)
      document.msExitFullscreen()
  }
}

function fullscreenChanged() {
  // Wait a frame for the dust to settle, then recalculate sizes
  setTimeout(() => {
    // Determine whether we're in fullscreen
    getIsFullscreen()

    // Manage the settings button's state
    const fullscreenButton = objects.find(o => o.id === FULLSCREEN_BUTTON)
    if (fullscreenButton) {
      fullscreenButton.text = fullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'
    }
    // Manage the dock button's state
    const fullscreenDockButton = objects.find(o => o.id === FULLSCREEN_DOCK_BUTTON)
    if (fullscreenDockButton) {
      const element = document.createElement('img')
      element.src = fullscreen ? EXIT_FULLSCREEN_ICON : ENTER_FULLSCREEN_ICON
      fullscreenDockButton.element = element
    }

    fitCanvasToContainer()
    if (fullscreen) calculatePpi()
    calculateObjectSizes()
  }, 30)
}

function getIsFullscreen() {
  fullscreen = !!(document.fullscreenElement
    || document.mozFullScreenElement
    || document.msFullscreenElement
    || document.webkitFullscreenElement
    || document.webkitIsFullScreen)
}

function onResize() {
  // Skip resize if we hopped into fullscreen. The fullscreen handler will handle it.
  if (!fullscreen)
    fitCanvasToContainer()
}
