import { GamepadManager, BUTTON_NAMES } from './GamepadManager'

const KEY_MAPPINGS = {
  left: ['ArrowLeft', 'a', 'A'],
  right: ['ArrowRight', 'd', 'D'],
  up: ['ArrowUp', 'w', 'W'],
  down: ['ArrowDown', 's', 'S'],
}

const mapDirectionToKeys = (direction) => {
  const validKeys = KEY_MAPPINGS[direction]
  return validKeys // undefined if no valid keys
}

const checkValidKeys = (direction, keys) => {
  const validKeys = mapDirectionToKeys(direction)
  return validKeys?.some((key) => keys.has(key)) ?? false
}

// TODO: UPDATE GAMEPAD MANAGER TO HANDLE JUST PRESSED AND RELEASED
export class InputManager {
  constructor() {
    this.curKeys = new Set()
    this.prevKeys = new Set()
    this.releasedKeys = new Set()
    this.gamepad = new GamepadManager()

    // will relying on JS event listeners pose problems (async race condition?)
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return
      this.prevKeys.add(e.key)
      this.curKeys.add(e.key)
    })
    window.addEventListener('keyup', (e) => {
      this.releasedKeys.add(e.key)
      this.curKeys.delete(e.key)
    })
  }
  // JUST PRESSED
  justPressedLeft() {
    return checkValidKeys('left', this.prevKeys)
  }
  justPressedRight() {
    return checkValidKeys('right', this.prevKeys)
  }
  justPressedUp() {
    return checkValidKeys('up', this.prevKeys)
  }
  justPressedDown() {
    return checkValidKeys('down', this.prevKeys)
  }
  // IS BEING HELD
  // TODO: rename CHECK
  isPressedLeft() {
    return (
      checkValidKeys('left', this.curKeys) ||
      this.gamepad.isButtonPressed(BUTTON_NAMES.DPAD_LEFT)
    )
  }
  isPressedRight() {
    return (
      checkValidKeys('right', this.curKeys) ||
      this.gamepad.isButtonPressed(BUTTON_NAMES.DPAD_RIGHT)
    )
  }
  isPressedUp() {
    return (
      checkValidKeys('up', this.curKeys) ||
      this.gamepad.isButtonPressed(BUTTON_NAMES.DPAD_UP)
    )
  }
  isPressedDown() {
    return (
      checkValidKeys('down', this.curKeys) ||
      this.gamepad.isButtonPressed(BUTTON_NAMES.DPAD_DOWN)
    )
  }
  // TODO: JUST RELEASED
  releasedLeft() {
    return checkValidKeys('left', this.releasedKeys)
  }
  releasedRight() {
    return checkValidKeys('right', this.releasedKeys)
  }
  releasedUp() {
    return checkValidKeys('up', this.releasedKeys)
  }
  releasedDown() {
    return checkValidKeys('down', this.releasedKeys)
  }

  // GAMEPAD
  isGamepadButtonPressed(buttonName) {
    return this.gamepad.isButtonPressed(buttonName)
  }

  isAnyGamepadButtonPressed() {
    return this.gamepad.isAnyButtonPressed()
  }

  postUpdate() {
    this.prevKeys.clear()
    this.releasedKeys.clear()
  }
}

// justPressed - keydown event in last tick
// justReleased - keyup event in last tick

// pressed
// check  = miRCo "isPressed"
// release
