import {
  ROOT_URL,
  DESKTOP_GROUP,
  PLEXICAM_GROUP,
  PLEXICAM_Z,
  MEETING_GROUP,
  GAZE_INDICATOR,
  GAZE_INDICATOR_Z,
} from './constants.js'

import {
  drawTargetCircle,
  preloadAsset,
  getGroupedObjects,
} from './helpers.js'

import { webgazerInit } from './webgazer.js'

////////////////
// Begin Macros

const PLEXICAM_PRO_MACRO = 'plexicam pro macro'
export const PLEXICAM_PRO = [
  {
    id: 'hanger',
    src: `${ROOT_URL}/assets/images/Hanger without Tab.png`,
    x: 270, y: -10, z: PLEXICAM_Z + 1,
    widthInches: 2, heightInches: 9.5, // inches
    group: {
      name: PLEXICAM_GROUP,
      centered: true,
      offset: { top: 0 },
    },
    mobility: ['x'],
    macro: PLEXICAM_PRO_MACRO,
  },
  {
    id: 'shelf',
    // src: `${ROOT_URL}/assets/assets/images/Shelf.png`, // Old shelf image
    src: `${ROOT_URL}/assets/images/Shelf - Color-Corrected.png`,
    z: PLEXICAM_Z + 2,
    widthInches: 2.1, heightInches: 2, // inches // Old shelf image
    // widthInches: 2.35, heightInches: 2.08, // inches
    group: {
      name: PLEXICAM_GROUP,
      centered: true,
      offset: { top: 2.875 }, // Old shelf image
      // offset: { top: 2.75 },
    },
    mobility: ['x', 'y'],
    macro: PLEXICAM_PRO_MACRO,
  },
  {
    id: 'sleeve',
    src: `${ROOT_URL}/assets/images/Sleeve.png`,
    z: PLEXICAM_Z + 3,
    widthInches: 2.24, heightInches: 2,
    group: {
      name: PLEXICAM_GROUP,
      centered: true,
      offset: { top: 2.33 },
    },
    mobility: ['x', 'y'],
    constraints: {
      y: [0, 7.5],
    },
    macro: PLEXICAM_PRO_MACRO,
  },
]

const BULLSEYE_MACRO = 'bullseye macro'
export const BULLSEYE = [
  {
    id: 'bullseye',
    draw: drawTargetCircle,
    z: PLEXICAM_Z - 1,
    widthInches: 6, heightInches: 6,
    group: {
      name: PLEXICAM_GROUP,
      centered: true,
      offset: { top: .5 },
    },
    mobility: ['x', 'y'],
    ignoreClick: true,
    macro: BULLSEYE_MACRO,
  },
]

const GAZE_TARGET_MACRO = 'gaze target macro'
const GAZE_TARGET_GROUP_PROPERTIES = [
  { offset: {top: 1, left: 1} }, // top left
  { offset: {top: 1}, centered: 'x' }, // top center
  { offset: {top: 1, right: 1} }, // top right
  { offset: {left: 1}, centered: 'y' }, // left
  { centered: 'both' }, // center
  { offset: {right: 1}, centered: 'y' }, // right
  { offset: {bottom: 1, left: 1} }, // bottom left
  { offset: {bottom: 1}, centered: 'x' }, // bottom center
  { offset: {bottom: 1, right: 1} }, // bottom right
]
export const GAZE_TARGETS = GAZE_TARGET_GROUP_PROPERTIES.map((properties, i) => {
  return {
    id: `gaze target ${i}`,
    draw: drawTargetCircle,
    onClick: targetClicked,
    z: PLEXICAM_Z + 10,
    widthInches: .75, heightInches: .75,
    pending: true,
    group: {
      name: DESKTOP_GROUP,
      ...properties,
    },
    macro: GAZE_TARGET_MACRO,
  }
})

// const WEBGAZER_MACRO = 'webgazer macro'
// export const WEBGAZER = [
//   {
//     id: 'webcam feed',
//     getElement: webgazer.getVideoElementCanvas,
//     z: 3.1,
//     width: 144, height: 108,
//     mirror: true,
//     group: {
//       name: MEETING_GROUP,
//       offset: { bottom: 0, left: 0, },
//     },
//     mobility: ['x', 'y'],
//     macro: WEBGAZER_MACRO,
//   },
//   {
//     id: GAZE_INDICATOR,
//     src: `${ROOT_URL}/assets/icons/eye-outline.png`,
//     z: GAZE_INDICATOR_Z,
//     width: 12, height: 12,
//     macro: WEBGAZER_MACRO,
//   },
// ]


// End Macros
/////////////

//////////////////////////
// Begin Exported Helpers

export function addMacro(objects, macro, callback) {
  if (!(objects && macro)) return

  for (const object of macro) {
    preloadAsset(object, () => {
      objects.push(object)
      if (callback) callback()
    })
  }
}

export function removeMacro(objects, macro) {
  if (!(objects && macro)) return

  for (const object of macro) {
    const i = objects.findIndex(o => o.id === object.id)
    if (i >= 0)
      objects.splice(i, 1)
  }
}

export function swapMacro(objects, oldMacro, newMacro, callback) {
  removeMacro(objects, oldMacro)
  addMacro(objects, newMacro, callback)
}

// End Exported Helpers
///////////////////////

/////////////////////////
// Begin Private Helpers

function targetClicked(targetObject, allObjects) {
  targetObject.pending = !targetObject.pending
  const group = getGroupedObjects(allObjects, { object: targetObject, includeSelf: true })
  const allClicked = !group.some((o) => o.pending)

  if (allClicked) {
    removeMacro(allObjects, GAZE_TARGETS)
  }
}

// End Private Helpers
//////////////////////
