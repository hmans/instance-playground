import { IEntity, Tag } from "miniplex"
import { createECS } from "miniplex/react"
import { Object3D, Vector3 } from "three"

export type RevadeEntity = Partial<{
  /* Tags */
  player: Tag
  enemy: Tag

  /* Components */
  transform: Object3D
  velocity: Vector3
}> &
  IEntity

export const ecs = createECS<RevadeEntity>()
