import { GamepadManager, BUTTON_NAMES } from './GamepadManager'

const KEY_MAPPINGS = {
  left: ['ArrowLeft', 'a', 'A', 'PointerLeft'],
  right: ['ArrowRight', 'd', 'D', 'PointerRight'],
  up: ['ArrowUp', 'w', 'W', 'PointerUp'],
  down: ['ArrowDown', 's', 'S', 'PointerDown'],
}

export class InputManager {
  constructor() {
    this.keys = new Set()
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
    window.addEventListener('pointerdown', new PointerEventHandler(this))
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

class PointerEventHandler {
  constructor(input) {
    this.input = input
  }

  threshold = 32

  handleEvent(event) {
    switch (event.type) {
      case 'pointerdown':
        window.addEventListener('pointermove', this)
        window.addEventListener('pointerup', this)
        window.addEventListener('pointercancel', this)
        event.preventDefault()
        this.x0 = event.clientX
        this.y0 = event.clientY
        break
      case 'pointermove':
        const dx = event.clientX - this.x0
        const dy = event.clientY - this.y0
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance > this.threshold) {
          const key = 'Pointer' + (Math.abs(dx) > Math.abs(dy) ?
            (dx < 0 ? 'Left' : 'Right') : (dy < 0 ? 'Up' : 'Down'))
          if (this.key !== key) {
            this.input.keys.add(key)
            if (this.key) {
              this.input.keys.delete(this.key)
            }
            this.key = key
          }
        } else if (this.key) {
          this.input.keys.delete(this.key)
          delete this.key
        }
        break
      case 'pointerup':
      case 'pointercancel':
        window.removeEventListener('pointermove', this)
        window.removeEventListener('pointerup', this)
        window.removeEventListener('pointercancel', this)
        if (this.key) {
          this.input.keys.delete(this.key)
        }
        delete this.key
    }
  }
}
