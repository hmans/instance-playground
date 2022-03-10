import { Archetype, IEntity } from "miniplex"

export const system =
  <TEntity extends IEntity = IEntity>(
    archetype: Archetype<TEntity>,
    fun: (entities: TEntity[], ...args: any[]) => void
  ) =>
  (...args: any[]) =>
    fun(archetype.entities, ...args)
