import { Archetype, IEntity } from "miniplex"

export const system =
  <TEntity extends IEntity = IEntity, TArgs extends any[] = any[]>(
    archetype: Archetype<TEntity>,
    fun: (entities: TEntity[], ...args: TArgs) => void
  ) =>
  (...args: TArgs) =>
    fun(archetype.entities, ...args)
