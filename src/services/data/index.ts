import type { DataService } from './DataService'
import { LocalDataService } from './LocalDataService'
import { ApiDataService } from './ApiDataService'
import { API_URL } from '../api/client'

export type { DataService }

/** API-backed when VITE_API_URL is set; localStorage demo mode otherwise. */
export const dataService: DataService = API_URL ? new ApiDataService() : new LocalDataService()
