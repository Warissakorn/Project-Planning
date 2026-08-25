import { nanoid } from 'nanoid'

/** Short unique id for nodes / structures / projects / edges. */
export const newId = (): string => nanoid(10)
