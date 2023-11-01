import {
  START_TIME,
  SCROLLING_TEXT_LINES_PER_SECOND,
  WINDOW_MANAGER_HEIGHT,
  DOCK_HEIGHT,
  FONT_SIZE,
  LINE_HEIGHT,
  MARGIN,
  BUTTON_RADIUS,
  colors,
  FONT_FAMILY,
  FONT_COLOR_LIGHT,
  TELEPROMPTER_FONT_SIZE,
  TELEPROMPTER_LINE_HEIGHT,
  TELEPROMPTER_MARGIN,
  TELEPROMPTER_PARAGRAPH_SPACE,
} from './constants.js'

export function drawTargetCircle(context, object) {
  const { x, y, width, pending } = object
  const radius = width / 2

  context.fillStyle = pending ? colors.closeBtn : colors.maximizeBtn
  context.globalAlpha = object.opacity || .5
  context.beginPath()
  context.arc(x + radius, y + radius, radius, 0, 2 * Math.PI)
  context.fill()
  context.globalAlpha = 1
}

export function drawRoundedRectangle(context, x, y, width, height, radius) {
  context.beginPath()
  context.moveTo(x + radius, y)
  context.lineTo(x + width - radius, y)
  context.quadraticCurveTo(x + width, y, x + width, y + radius)
  context.lineTo(x + width, y + height - radius)
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  context.lineTo(x + radius, y + height)
  context.quadraticCurveTo(x, y + height, x, y + height - radius)
  context.lineTo(x, y + radius)
  context.quadraticCurveTo(x, y, x + radius, y)
  context.closePath()
}

export function drawButton(context, object) {
  const { x, y, width, height, color, text } = object

  // Draw the button
  context.beginPath()
  drawRoundedRectangle(context, x, y, width, height, BUTTON_RADIUS)
  context.fillStyle = color || colors.btn
  context.fill()

  // Write the text
  if (text) {
    const textOffset = y + MARGIN + (object.height / 2)

    context.fillStyle = colors.btnText
    context.font = `${FONT_SIZE}px ${FONT_FAMILY}`
    context.textAlign = 'center'
    context.textBaseline = 'alphabetic'
    context.fillText(text, x + (width / 2), textOffset)
  }
}

export function drawDropdown(context, object) {
  const top = object.y
  const bottom = top + object.height
  const left = object.x
  const right = left + object.width

  // Draw box around the dropdown and, if expanded, its options
  const boxHeight = object.expanded
    ? object.height + (object.options.length * LINE_HEIGHT)
    : object.height
  context.fillStyle = colors.window
  context.strokeStyle = 'black'
  drawRoundedRectangle(context, left, top, object.width, boxHeight, BUTTON_RADIUS)
  context.fill()
  context.stroke()

  // Draw arrow
  const arrowSize = [8, 5]
  const arrowTop = top + ((object.height - arrowSize[1]) / 2)
  const arrowLeftCorner = [right - MARGIN - arrowSize[0], arrowTop]
  const arrowRightCorner = [right - MARGIN, arrowTop]
  const arrowBottomCorner = [right - MARGIN - (arrowSize[0] / 2), arrowTop + arrowSize[1]]
  context.beginPath()
  context.moveTo(arrowLeftCorner[0], arrowLeftCorner[1])
  context.lineTo(arrowRightCorner[0], arrowRightCorner[1])
  context.lineTo(arrowBottomCorner[0], arrowBottomCorner[1])
  context.closePath()
  context.fillStyle = 'black'
  context.fill()

  // Draw value
  const textOffset = top + MARGIN + (object.height / 2)
  const displayValue = object.value ? `${object.value}` : object.defaultText
  context.fillStyle = 'black'
  context.font = '12px Sans-Serif'
  context.textAlign = 'left'
  context.textBaseline = 'alphabetic'
  context.fillText(displayValue, left + MARGIN, textOffset)
}

export function drawDropdownOption(context, option) {
  // Draw text
  context.fillStyle = 'black'
  context.font = '12px Sans-Serif'
  context.fillText(option.text, option.x + MARGIN, option.y + LINE_HEIGHT - MARGIN)
}

// Generates a fake toolbar above the given element and groups the two
export function drawWindowManager(context, object) {
  const radius = WINDOW_MANAGER_HEIGHT * 0.5
  const straightSide = WINDOW_MANAGER_HEIGHT - radius
  const top = object.y - WINDOW_MANAGER_HEIGHT
  const bottom = object.y
  const left = object.x
  const right = left + object.width

  // Draw this shape for the toolbar:
  //    ________________
  //  /                  \
  // |                    |
  // +--------------------
  context.beginPath()
  context.moveTo(left, bottom)                           // +
  context.lineTo(left, bottom - straightSide)            // |
  context.arcTo(left, top, left + radius, top, radius)   // /
  context.lineTo(right - radius, top)                    //   ______________
  context.arcTo(right, top, right, top + radius, radius) //                  \
  context.lineTo(right, bottom)                          //                   |
  context.closePath()                                    //  -----------------
  // Fill the shape
  context.fillStyle = colors.toolbar
  context.fill()

  // Draw buttons
  const halfHeight = (WINDOW_MANAGER_HEIGHT / 2)
  // Close
  context.beginPath()
  context.arc(left + halfHeight, top + halfHeight, halfHeight / 2, 2 * Math.PI, false);
  context.closePath()
  context.fillStyle = colors.closeBtn
  context.fill()
  // Minimize
  context.beginPath()
  context.arc(left + (2.5 * halfHeight), top + halfHeight, halfHeight / 2, 2 * Math.PI, false);
  context.closePath()
  context.fillStyle = colors.minimizeBtn
  context.fill()
  // Maximize
  context.beginPath()
  context.arc(left + (4 * halfHeight), top + halfHeight, halfHeight / 2, 2 * Math.PI, false);
  context.closePath()
  context.fillStyle = colors.maximizeBtn
  context.fill()
}

export function drawDock(context) {
  const top = canvas.height - DOCK_HEIGHT
  const bottom = canvas.height
  const left = 0
  const right = canvas.width

  // Dock
  context.beginPath()
  context.moveTo(left, bottom)
  context.lineTo(left, top)
  context.lineTo(right, top)
  context.lineTo(right, bottom)
  context.lineTo(left, bottom)
  context.fillStyle = colors.toolbar
  context.fill()
}

export function drawDebugInfo(context, mouseX, mouseY, object) {
  // Draw object's debug info
  if (object) {
    const { x, y, z, width, height, debugColor } = object

    // Bounding box
    context.strokeStyle = debugColor
    context.beginPath()
    context.rect(x, y, width, height)
    context.closePath()
    context.stroke()

    // Coordinates, offset from the upper-left corner
    const text = `${x}, ${y}, ${z}`
    const textWidth = context.measureText(text).width
    context.fillStyle = debugColor
    context.font = '12px Sans-Serif'
    context.fillText(text, x - textWidth - 5, y - 7)
  }
  // Draw global debug info
  else {
    const text = `${mouseX}, ${mouseY}`
    const textWidth = context.measureText(text).width
    context.fillStyle = 'magenta'
    context.font = '12px Sans-Serif'
    context.fillText(text, mouseX - textWidth - 5, mouseY - 7)
  }
}

export function formatTextForArea(context, text, width) {
  const font = `${TELEPROMPTER_FONT_SIZE}px ${FONT_FAMILY}`

  context.font = font
  context.textAlign = 'left'
  context.textBaseline = 'top'

  const rawLines = text.split('\n').join(' \n ') // Surround newlines with spaces so they're treated like words
  const words = rawLines.split(' ')

  var lines = []
  var line = ''
  var space = ''

  while (words.length > 0) {
    var word = words.shift()

    if (word === '\n') {
      lines.push(line)
      lines.push('')
      space = ''
      line = ''
      continue
    }

    var testWidth = context.measureText(line + space + word).width
    if (testWidth < width - TELEPROMPTER_MARGIN - TELEPROMPTER_MARGIN) {
      line += space + word;
      space = ' ';
    } else {
      if (space === '') { // If a singular word is too big, put it in anyway.
        line += word;
      } else {
        words.unshift(word);
      }
      lines.push(line);
      space = '';
      line = '';
    }
  }

  if (line !== "") {
    lines.push(line);
  }

  return lines.join('\n')
}

export function drawScrollingText(context, object) {
  const { text, x, y, width, height } = object
  const lines = text.split('\n')
  const startOffset = height - ((SCROLLING_TEXT_LINES_PER_SECOND * (Date.now() - START_TIME) / 1000) * TELEPROMPTER_LINE_HEIGHT)

  context.save()
  context.beginPath()
  context.rect(x, y, width, height)
  context.clip()

  // Fill the background
  context.fillStyle = 'black'
  context.fill()

  // Draw the text
  context.fillStyle = FONT_COLOR_LIGHT
  context.font = `${TELEPROMPTER_FONT_SIZE}px ${FONT_FAMILY}`

  var lineOffset = 0
  for (var i = 0; i < lines.length; i++) {
    // Important text does not like being place at fractions of a pixel
    // make sure you round the y pos
    lineOffset += lines[i] === '' ? TELEPROMPTER_PARAGRAPH_SPACE : TELEPROMPTER_LINE_HEIGHT
    context.fillText(lines[i], x + TELEPROMPTER_MARGIN, Math.floor(y + startOffset + lineOffset))
  }
  context.restore() // remove the clipping
}
