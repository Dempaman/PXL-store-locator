export type StoreType = string

export type Region = string

export interface Store {
  id: string
  name: string
  address: string
  city: string
  postalCode: string
  region: Region
  storeType: StoreType
  latitude: number
  longitude: number
  phone?: string
  openingHours?: string
}

export interface FilterState {
  search: string
  region: Region | "all"
  storeType: StoreType | "all"
  sortBy: "name" | "city" | "distance"
}

export interface UserLocation {
  latitude: number
  longitude: number
}
