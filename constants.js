import { TELEPROMPTER_SCRIPT as TELEPROMPTER_SCRIPT_TEXT } from "./assets/text/teleprompter-script.js"

// Globals
export const DEBUG = false
export const DEVELOPMENT = ['localhost', '127.0.0.1'].includes(window.location.hostname)
export const ROOT_URL = DEVELOPMENT ? '.' : 'https://plexisimulator.s3.us-east-1.amazonaws.com'

// Timing
export const FRAME_RATE = 30
export const START_TIME = Date.now()
export const SCROLLING_TEXT_LINES_PER_SECOND = 1

// Entities
export const WALLPAPER = 'wallpaper'
export const WALLPAPER_Z = 0
export const MAX_WINDOW_Z = 900
export const DESKTOP_GROUP = 'desktop'
export const DOCK = 'dock'
export const DOCK_Z = 901
export const PLEXICAM_GROUP = 'plexicam'
export const PLEXICAM_Z = 1000
export const MEETING_GROUP = 'meeting'
export const FULLSCREEN_BUTTON = 'fullscreen button'
export const FULLSCREEN_DOCK_BUTTON = `dock_${FULLSCREEN_BUTTON}`
export const ENTER_FULLSCREEN_ICON = `${ROOT_URL}/assets/icons/fullscreen.png`
export const EXIT_FULLSCREEN_ICON = `${ROOT_URL}/assets/icons/fullscreen-exit.png`
export const EYE_TRACKING_BUTTON = 'eye tracking button'
export const GAZE_INDICATOR = 'gaze indicator'
export const GAZE_INDICATOR_Z = 2000
export const TELEPROMPTER_SCRIPT = TELEPROMPTER_SCRIPT_TEXT.replace(/\n\s+/g, '\n')

// Entity types
export const TYPES = {
  button: 'button',
  invisibleButton: 'invisibleButton',
  dropdown: 'dropdown',
  dropdownOption: 'dropdownOption',
}

// Text
export const FONT_FAMILY = 'Sans-Serif'
export const FONT_SIZE = 12
export const LINE_HEIGHT = 20
export const FONT_COLOR_LIGHT = '#ffffff'
export const FONT_COLOR_DARK = '#000000'
export const TELEPROMPTER_FONT_SIZE = 20
export const TELEPROMPTER_LINE_HEIGHT = 28
export const TELEPROMPTER_PARAGRAPH_SPACE = TELEPROMPTER_LINE_HEIGHT / 2

// Spacing
export const WINDOW_MANAGER_HEIGHT = 20
export const DOCK_HEIGHT = 40
export const MARGIN = 5
export const TELEPROMPTER_MARGIN = MARGIN * 3
export const BUTTON_HEIGHT = 22
export const BUTTON_RADIUS = 5
export const MAX_OFFSCREEN_DISTANCE = 20

// Settings
export const SCREEN_SIZE_SETTING = 'screenSizeSetting'
export const SCREEN_TYPE_SETTING = 'screenTypeSetting'
export const BULLSEYE_DISPLAY_SETTING = 'bullseyeDisplaySetting'
export const booleanOptions = [
  { text: 'On', value: true },
  { text: 'Off', value: false },
]
export const screenSizes = [
  { text: '13"', value: 13 },
  { text: '15"', value: 15 },
  { text: '17"', value: 17 },
  { text: '24"', value: 24 },
  { text: '27"', value: 27 },
  { text: '32"', value: 32 },
  { text: '34"', value: 34 },
  { text: '43"', value: 43 },
  { text: '49"', value: 49 },
]
export const screenTypes = [
  { text: '4K/Retina', value: true },
  { text: 'Normal', value: false },
]
export const colors = {
  toolbar: '#484848',
  window: '#ffffff',
  btn: '#0494c5',
  btnText: '#ffffff',
  btnOutline: '#ffffff',
  closeBtn: '#ff605c',
  minimizeBtn: '#ffbd44',
  maximizeBtn: '#00ca4e',
}
