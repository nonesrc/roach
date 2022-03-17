export type Course = {
  code: string
  name: string
  credit: string
  courseIdx: string
  class: string
  teacher: string
}

export type CourseTab = {
  code: string
  name: string
  num: string
  activities: {
    room: string
    startWeek: number
    endWeek: number
    rule: string
    coordinates: [number, number][]
  }[]
}
