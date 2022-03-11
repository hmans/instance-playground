import {
  Control,
  Device,
  GamepadDevice,
  KeyboardDevice,
  VectorControl
} from "@hmans/controlfreak"

const normalizeVector = ({ value }: VectorControl) => {
  const length = Math.sqrt(value.x ** 2 + value.y ** 2) || 1
  value.x /= length
  value.y /= length
}

const compositeKeyboardVector =
  (controller: Controller, up: string, down: string, left: string, right: string) =>
  ({ value }: VectorControl) => {
    if (controller.activeDevice instanceof KeyboardDevice) {
      const { isPressed } = controller.activeDevice
      value.x = isPressed(right) - isPressed(left)
      value.y = isPressed(up) - isPressed(down)
    }
  }

const gamepadAxisVector =
  (controller: Controller, horizontalAxis = 0, verticalAxis = 1) =>
  ({ value }: VectorControl) => {
    if (controller.activeDevice instanceof GamepadDevice) {
      const { device } = controller.activeDevice

      if (device) {
        value.x = device.axes[horizontalAxis]
        value.y = -device.axes[verticalAxis]
      }
    }
  }

class Controller {
  devices: Device[] = [new KeyboardDevice().start(), new GamepadDevice().start()]
  activeDevice: Device = null!

  controls: Record<string, Control> = {}

  constructor() {
    for (const device of this.devices) {
      device.onActivity.on(() => (this.activeDevice = device))
    }
  }

  update() {
    for (const device of this.devices) device.update()
    for (const control of Object.values(this.controls)) control.update()
  }
}

export const controller = new Controller()

controller.controls.move = new VectorControl()
  .addStep(compositeKeyboardVector(controller, "w", "s", "a", "d"))
  .addStep(gamepadAxisVector(controller, 0, 1))
  .addStep(normalizeVector)

controller.controls.aim = new VectorControl()
  .addStep(compositeKeyboardVector(controller, "up", "down", "left", "right"))
  .addStep(gamepadAxisVector(controller, 2, 3))
  .addStep(normalizeVector)
