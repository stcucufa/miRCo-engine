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
