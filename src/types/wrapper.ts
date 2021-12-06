export interface roachResHeaderType {
  status: boolean
  code?: number
  msg?: string
  [k: string]: any
}

export interface roachResType extends roachResHeaderType {
  data: any
}
