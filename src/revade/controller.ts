import { GamepadDevice, KeyboardDevice, VectorControl } from "../lib/controlfreak/"

const devices = {
  keyboard: new KeyboardDevice().start(),
  gamepad: new GamepadDevice().start()
}

let activeDevice: keyof typeof devices = "keyboard"

devices.keyboard.onActivity.on(() => (activeDevice = "keyboard"))
devices.gamepad.onActivity.on(() => (activeDevice = "gamepad"))

export const stick = new VectorControl()
  .addStep(({ value }) => {
    if (activeDevice === "keyboard") {
      if (devices.keyboard.isPressed("w")) value.y += 1
      if (devices.keyboard.isPressed("s")) value.y -= 1
      if (devices.keyboard.isPressed("a")) value.x -= 1
      if (devices.keyboard.isPressed("d")) value.x += 1
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
