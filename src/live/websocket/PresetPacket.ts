import Packet, { PacketType } from "./Packet";

export namespace PresetPacket {

  export function enterRoomPacket(anchorUserId: number, roomId: number): Packet {
    const content = new TextEncoder().encode(JSON.stringify({uid: anchorUserId, roomid: roomId, protover: 0})).buffer
    return new Packet(undefined, PacketType.ENTER_ROOM, undefined, content)
  }

  export function heartbeatPacket(content?: ArrayBuffer) {
    content = content ?? new TextEncoder().encode("[object Object]").buffer
    return new Packet(undefined, PacketType.HEARTBEAT, undefined, content);
  }
}