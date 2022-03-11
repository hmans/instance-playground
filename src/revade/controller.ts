import { Device, GamepadDevice, KeyboardDevice, VectorControl } from "@hmans/controlfreak"

export const devices = [new KeyboardDevice().start(), new GamepadDevice().start()]

let activeDevice: Device

for (const device of devices) {
  device.onActivity.on(() => (activeDevice = device))
}

const normalizeVector = ({ value }: VectorControl) => {
  const length = Math.sqrt(value.x ** 2 + value.y ** 2) || 1
  value.x /= length
  value.y /= length
}

const compositeKeyboardVector =
  (up = "w", down = "s", left = "a", right = "d") =>
  ({ value }: VectorControl) => {
    if (activeDevice instanceof KeyboardDevice) {
      const { isPressed } = activeDevice
      value.x = isPressed(right) - isPressed(left)
      value.y = isPressed(up) - isPressed(down)
    }
  }

const gamepadAxisVector =
  (horizontalAxis = 0, verticalAxis = 1) =>
  ({ value }: VectorControl) => {
    if (activeDevice instanceof GamepadDevice) {
      const { device } = activeDevice

      if (device) {
        value.x = device.axes[horizontalAxis]
        value.y = -device.axes[verticalAxis]
      }
    }
  }

export const controls = {
  stick: new VectorControl()
    .addStep(compositeKeyboardVector())
    .addStep(gamepadAxisVector())
    .addStep(normalizeVector)
}

export const update = () => {
  for (const device of devices) device.update()
  for (const control of Object.values(controls)) control.update()
}
