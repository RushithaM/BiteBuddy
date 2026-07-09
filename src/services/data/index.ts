import type { DataService } from './DataService'
import { LocalDataService } from './LocalDataService'

export type { DataService }

/** Singleton service instance. Swap for a RemoteDataService when a backend exists. */
export const dataService: DataService = new LocalDataService()
