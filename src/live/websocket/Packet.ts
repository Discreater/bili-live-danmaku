import ByteBuffer from "../../shared/ByteBuffer"

export enum PacketType {
  UNKNOWN = 0,
  HEARTBEAT = 2,
  POPULARITY = 3,
  COMMAND = 5,
  ENTER_ROOM = 7,
  ENTER_ROOM_RESPONSE = 8
}

export function getPacketType(n: number): PacketType {
  return n in PacketType ? n : PacketType.UNKNOWN
}

export default class Packet {
  protocol: number
  packetType: PacketType
  tag: number
  content: ArrayBuffer
  constructor(
    protocol: number = 1,
    packetType: PacketType,
    tag: number = 1,
    content: ArrayBuffer
  ) {
    this.protocol = protocol
    this.packetType = packetType
    this.tag = tag
    this.content = content
  }

  readonly headerLength: number = 0x10

  get totalLength(): number {
    return this.headerLength + this.content.byteLength
  }

  get popularity(): number {
    const view = new DataView(this.content)
    return view.getInt32(0);
  }

  get command(): any {
    const view = new DataView(this.content)
    const res = new TextDecoder("utf-8").decode(view);
    return JSON.parse(res);
  }
  public toFrame(): ArrayBuffer {
    const buffer = new ArrayBuffer(this.totalLength)
    new ByteBuffer(buffer)
      .putInt32(this.totalLength)
      .putInt16(this.headerLength)
      .putInt16(this.protocol)
      .putInt32(this.packetType)
      .putInt32(this.tag)
      .put(this.content);
    return buffer;
  }
}
