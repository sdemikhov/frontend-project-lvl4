export type Channel = {
  readonly id: number,
  readonly name: string,
  readonly removable: boolean,
}

export type Message = {
  readonly id: number,
  readonly channelId: number,
  readonly sender: string,
  readonly body: string,
}

export type User = {
  readonly id: number,
  readonly username: string,
  readonly password: string,
}

export type InitialData = {
  readonly messages: readonly Message[],
  readonly channels: readonly Channel[],
  readonly currentChannelId: number,
}
