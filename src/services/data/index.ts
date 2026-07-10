import type { DataService } from './DataService'
import { ApiDataService } from './ApiDataService'

export type { DataService }

export const dataService: DataService = new ApiDataService()
