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

export class InputManager {
  constructor() {
    this.curKeys = new Set()
    this.prevKeys = new Set()
    this.releasedKeys = new Set()
    this.gamepad = new GamepadManager()

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
    return (
      checkValidKeys('left', this.prevKeys) ||
      this.gamepad.isButtonJustPressed(BUTTON_NAMES.DPAD_LEFT)
    )
  }
  justPressedRight() {
    return (
      checkValidKeys('right', this.prevKeys) ||
      this.gamepad.isButtonJustPressed(BUTTON_NAMES.DPAD_RIGHT)
    )
  }
  justPressedUp() {
    return (
      checkValidKeys('up', this.prevKeys) ||
      this.gamepad.isButtonJustPressed(BUTTON_NAMES.DPAD_UP)
    )
  }
  justPressedDown() {
    return (
      checkValidKeys('down', this.prevKeys) ||
      this.gamepad.isButtonJustPressed(BUTTON_NAMES.DPAD_DOWN)
    )
  }

  // IS BEING HELD
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
    return (
      checkValidKeys('left', this.releasedKeys) ||
      this.gamepad.isButtonReleased(BUTTON_NAMES.DPAD_LEFT)
    )
  }
  releasedRight() {
    return (
      checkValidKeys('right', this.releasedKeys) ||
      this.gamepad.isButtonReleased(BUTTON_NAMES.DPAD_RIGHT)
    )
  }
  releasedUp() {
    return (
      checkValidKeys('up', this.releasedKeys) ||
      this.gamepad.isButtonReleased(BUTTON_NAMES.DPAD_UP)
    )
  }
  releasedDown() {
    return (
      checkValidKeys('down', this.releasedKeys) ||
      this.gamepad.isButtonReleased(BUTTON_NAMES.DPAD_DOWN)
    )
  }

  // used for dismissing start splash in engine
  isAnyGamepadButtonPressed() {
    return this.gamepad.isAnyButtonPressed()
  }

  postUpdate() {
    this.prevKeys.clear()
    this.releasedKeys.clear()
    this.gamepad.postUpdate()
  }
}
