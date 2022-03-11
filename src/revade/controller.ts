import { GamepadDevice, KeyboardDevice, VectorControl } from "../lib/controlfreak/"

export const devices = {
  keyboard: new KeyboardDevice().start(),
  gamepad: new GamepadDevice().start()
}

let activeDevice: keyof typeof devices = "keyboard"

devices.keyboard.onActivity.on(() => (activeDevice = "keyboard"))
devices.gamepad.onActivity.on(() => (activeDevice = "gamepad"))

export const stick = new VectorControl()
  .addStep(({ value }) => {
    if (activeDevice === "keyboard") {
      const { isPressed } = devices.keyboard
      value.x = isPressed("d") - isPressed("a")
      value.y = isPressed("w") - isPressed("s")
    }
  })
  .addStep(({ value }) => {
    if (activeDevice === "gamepad") {
      const { gamepad } = devices

      if (gamepad.device) {
        value.x = gamepad.device.axes[0]
        value.y = -gamepad.device.axes[1]
      }
    }
  })
  .addStep(({ value }) => {
    const length = Math.sqrt(value.x ** 2 + value.y ** 2) || 1
    value.x /= length
    value.y /= length
  })
