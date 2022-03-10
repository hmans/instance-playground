import { Archetype, IEntity } from "miniplex"

export const system =
  <TEntity extends IEntity = IEntity, TArgs extends any[] = any[]>(
    archetype: Archetype<TEntity>,
    fun: (entities: TEntity[], ...args: TArgs) => void
  ) =>
  (...args: TArgs) =>
    fun(archetype.entities, ...args)

export const batchedSystem = <TEntity extends IEntity = IEntity, TArgs extends any[] = any[]>(
  archetype: Archetype<TEntity>,
  batchSize: number,
  fun: (entities: TEntity[], ...args: TArgs) => void
) => {
  let offset = 0
  const { entities } = archetype

  return (...args: TArgs) => {
    const batch = entities.slice(offset, offset + batchSize)
    fun(batch, ...args)
    offset = (offset + batch.length) % (entities.length || 1)
  }
}
