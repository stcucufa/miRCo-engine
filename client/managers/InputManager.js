import { GamepadManager, BUTTON_NAMES } from './GamepadManager'

const KEY_MAPPINGS = {
  left: ['ArrowLeft', 'a', 'A'],
  right: ['ArrowRight', 'd', 'D'],
  up: ['ArrowUp', 'w', 'W'],
  down: ['ArrowDown', 's', 'S'],
}

export class InputManager {
  constructor() {
    this.keys = new Set()
    this.prevKeys = new Set()
    this.gamepad = new GamepadManager()

    this.isPressedLeft = this.isPressedLeft.bind(this)
    this.isPressedRight = this.isPressedRight.bind(this)
    this.isPressedUp = this.isPressedUp.bind(this)
    this.isPressedDown = this.isPressedDown.bind(this)
    this.isDirectionPressed = this.isDirectionPressed.bind(this)
    this.isGamepadButtonPressed = this.isGamepadButtonPressed.bind(this)
    this.isAnyGamepadButtonPressed = this.isAnyGamepadButtonPressed.bind(this)

    window.addEventListener('keydown', (e) => this.keys.add(e.key))
    window.addEventListener('keyup', (e) => this.keys.delete(e.key))
  }

  isPressedLeft() {
    return (
      this.isDirectionPressed('left') ||
      this.gamepad.isButtonPressed(BUTTON_NAMES.DPAD_LEFT)
    )
  }
  isPressedRight() {
    return (
      this.isDirectionPressed('right') ||
      this.gamepad.isButtonPressed(BUTTON_NAMES.DPAD_RIGHT)
    )
  }
  isPressedUp() {
    return (
      this.isDirectionPressed('up') ||
      this.gamepad.isButtonPressed(BUTTON_NAMES.DPAD_UP)
    )
  }
  isPressedDown() {
    return (
      this.isDirectionPressed('down') ||
      this.gamepad.isButtonPressed(BUTTON_NAMES.DPAD_DOWN)
    )
  }

  isDirectionPressed(direction) {
    const validKeys = KEY_MAPPINGS[direction]
    if (!validKeys) return false
    return validKeys.some((key) => this.keys.has(key))
  }

  isGamepadButtonPressed(buttonName) {
    return this.gamepad.isButtonPressed(buttonName)
  }

  isAnyGamepadButtonPressed() {
    return this.gamepad.isAnyButtonPressed()
  }
}

// justPressed - keydown event in last tick
// justReleased - keyup event in last tick

// pressed
// check - = miRCo "isPressed"
// release
