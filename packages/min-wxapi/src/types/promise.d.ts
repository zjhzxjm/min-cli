declare class Promise<T> {
  constructor (callback: Function)

  static reject (err: any)

  progress (callback: Function)

  abort (callback: Function)
}
