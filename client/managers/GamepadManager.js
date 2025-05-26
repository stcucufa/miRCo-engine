// https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API

export const BUTTON_NAMES = {
  DPAD_UP: 'DPadUp',
  DPAD_DOWN: 'DPadDown',
  DPAD_LEFT: 'DPadLeft',
  DPAD_RIGHT: 'DPadRight',
}

export const BUTTON_MAPPINGS = new Map([
  [
    'default',
    new Map([
      [BUTTON_NAMES.DPAD_UP, 12],
      [BUTTON_NAMES.DPAD_DOWN, 13],
      [BUTTON_NAMES.DPAD_LEFT, 14],
      [BUTTON_NAMES.DPAD_RIGHT, 15],
    ]),
  ],
  [
    'Gamestop Controller (STANDARD GAMEPAD Vendor: 045e Product: 028e)',
    new Map([
      [BUTTON_NAMES.DPAD_UP, 12],
      [BUTTON_NAMES.DPAD_DOWN, 13],
      [BUTTON_NAMES.DPAD_LEFT, 14],
      [BUTTON_NAMES.DPAD_RIGHT, 15],
    ]),
  ],
  [
    'Microsoft X-Box 360 pad 0 (STANDARD GAMEPAD Vendor: 28de Product: 11ff)',
    new Map([
      [BUTTON_NAMES.DPAD_UP, 12],
      [BUTTON_NAMES.DPAD_DOWN, 13],
      [BUTTON_NAMES.DPAD_LEFT, 14],
      [BUTTON_NAMES.DPAD_RIGHT, 15],
    ]),
  ],
])

export class GamepadManager {
  constructor() {
    this.gamepads = []
    this.curButtons = new Map() // Currently pressed buttons
    this.prevButtons = new Map() // Previous frame's buttons
    this.releasedButtons = new Map() // Buttons released this frame

    if ('getGamepads' in navigator) {
      window.addEventListener('gamepadconnected', this.handleGamepadConnected)
      window.addEventListener(
        'gamepaddisconnected',
        this.handleGamepadDisconnected
      )
      this.updateGamepadState()
    }
  }

  handleGamepadConnected = (event) => {
    const gamepad = event.gamepad
    console.log(
      'Gamepad connected at index %d: %s. %d buttons, %d axes.',
      gamepad.index,
      gamepad.id,
      gamepad.buttons.length,
      gamepad.axes.length
    )
    this.gamepads[gamepad.index] = gamepad

    // Initialize button state maps for new gamepad
    this.curButtons.set(
      gamepad.index,
      new Array(gamepad.buttons.length).fill(false)
    )
    this.prevButtons.set(
      gamepad.index,
      new Array(gamepad.buttons.length).fill(false)
    )
    this.releasedButtons.set(
      gamepad.index,
      new Array(gamepad.buttons.length).fill(false)
    )
  }

  handleGamepadDisconnected = (event) => {
    const gamepad = event.gamepad
    console.log(
      'Gamepad disconnected from index %d: %s',
      gamepad.index,
      gamepad.id
    )
    delete this.gamepads[gamepad.index]
    this.curButtons.delete(gamepad.index)
    this.prevButtons.delete(gamepad.index)
    this.releasedButtons.delete(gamepad.index)
  }

  updateGamepadState = () => {
    const gamepads = navigator.getGamepads()
    for (const gamepad of gamepads) {
      if (!gamepad) continue

      const curState = this.curButtons.get(gamepad.index)
      const prevState = this.prevButtons.get(gamepad.index)
      const released = this.releasedButtons.get(gamepad.index)

      // Update button states
      gamepad.buttons.forEach((button, index) => {
        prevState[index] = curState[index]
        curState[index] = button.pressed
        released[index] = !curState[index] && prevState[index]
      })

      this.gamepads[gamepad.index] = gamepad
    }
    requestAnimationFrame(this.updateGamepadState)
  }

  hasGamepad() {
    return this.gamepads.length > 0
  }

  isButtonPressed(buttonName) {
    for (const gamepad of this.gamepads) {
      if (!gamepad) continue

      const mappings =
        BUTTON_MAPPINGS.get(gamepad.id) || BUTTON_MAPPINGS.get('default')
      const buttonIndex = mappings.get(buttonName)
      const curState = this.curButtons.get(gamepad.index)

      if (curState && curState[buttonIndex]) {
        return true
      }
    }
    return false
  }

  isButtonJustPressed(buttonName) {
    for (const gamepad of this.gamepads) {
      if (!gamepad) continue

      const mappings =
        BUTTON_MAPPINGS.get(gamepad.id) || BUTTON_MAPPINGS.get('default')
      const buttonIndex = mappings.get(buttonName)
      const curState = this.curButtons.get(gamepad.index)
      const prevState = this.prevButtons.get(gamepad.index)

      if (
        curState &&
        prevState &&
        curState[buttonIndex] &&
        !prevState[buttonIndex]
      ) {
        return true
      }
    }
    return false
  }

  isButtonReleased(buttonName) {
    for (const gamepad of this.gamepads) {
      if (!gamepad) continue

      const mappings =
        BUTTON_MAPPINGS.get(gamepad.id) || BUTTON_MAPPINGS.get('default')
      const buttonIndex = mappings.get(buttonName)
      const released = this.releasedButtons.get(gamepad.index)

      if (released && released[buttonIndex]) {
        return true
      }
    }
    return false
  }

  isAnyButtonPressed() {
    for (const gamepad of this.gamepads) {
      if (!gamepad) continue

      const curState = this.curButtons.get(gamepad.index)
      if (curState && curState.some((pressed) => pressed)) {
        return true
      }
    }
    return false
  }

  postUpdate() {
    for (const gamepad of this.gamepads) {
      if (!gamepad) continue

      const released = this.releasedButtons.get(gamepad.index)
      if (released) {
        released.fill(false)
      }
    }
  }

  pulse() {
    for (const gamepad of this.gamepads) {
      if (!gamepad) continue
      if (gamepad.vibrationActuator) {
        gamepad.vibrationActuator.playEffect('dual-rumble', {
          startDelay: 0,
          duration: 100,
          weakMagnitude: 1.0,
          strongMagnitude: 1.0,
        })
      }
    }
  }
}
