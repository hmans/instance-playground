export type SpatialHash = string
export type SpatialHashTable<T> = Map<SpatialHash, T[]>

type IVector3 = { x: number; y: number; z: number }

type Cell = [number, number, number]

export function calculateCell({ x, y, z }: IVector3, cellSize = 30): Cell {
  return [Math.floor(x / cellSize), Math.floor(y / cellSize), Math.floor(z / cellSize)]
}

export function calculateHashForCell(cell: Cell): SpatialHash {
  /* It's fast :b */
  return JSON.stringify(cell)
}

export function calculateHashForPosition(position: IVector3, cellSize = 10): SpatialHash {
  return calculateHashForCell(calculateCell(position, cellSize))
}
