import * as zlib from 'zlib';
import WebSocket = require('ws');
import { LiveAPI } from '../LiveAPI';
import type { BilibiliClient } from '../../BilibiliClient';
import ByteBuffer from '../../shared/ByteBuffer';
import { PresetPacket } from './PresetPacket';
import Packet, { PacketType, getPacketType } from './Packet';

interface CloseReason {
  code: number
  message?: string
}

interface LiveClientConfig {
  /** 是否在连接前先获取房间号（长号） */
  fetchRoomId?: boolean
  /** 是否在连接前先获取弹幕推送服务器地址 */
  fetchDanmakuConfig?: boolean
  /** 是否产生直播间观看历史记录 */
  doEntryRoomAction?: boolean
  /** 是否发送 rest 心跳包, 这会增加观看直播的时长, 用于服务端统计(与弹幕推送无关) */
  sendUserOnlineHeart?: boolean
}

interface LiveCallback {
  onConnect?: (client: LiveClient) => void
  onPopularityPacket?: (popularity: number, client: LiveClient) => void
  onCommandPacket?: (obj: any, client: LiveClient) => void
  onClose?: (reason: CloseReason, client: LiveClient) => void
}

const defaultConfig: LiveClientConfig = {
  fetchRoomId: true,
  fetchDanmakuConfig: true,
  doEntryRoomAction: false,
  sendUserOnlineHeart: false,
};

/**
 * 直播客户端
 */
export class LiveClient {
  private roomId: number;
  private config: LiveClientConfig;
  private _callbacks: LiveCallback;
  private restHeartBearJob?: ReturnType<typeof setInterval>;
  private websocketHeartBeatJob?: ReturnType<typeof setInterval>;
  /**
   *
   * @param bilibiliClient 客户端
   * @param maybeShortRoomId 房间号(可能为短号)
   * @param callbacks
   * @param config 可选配置
   */
  constructor(
    private readonly bilibiliClient: BilibiliClient,
    maybeShortRoomId: number,
    callbacks: LiveCallback = {},
    config: LiveClientConfig = defaultConfig,
  ) {
    this.roomId = maybeShortRoomId;
    this._callbacks = callbacks;
    this.config = { ...defaultConfig, ...config };
  }

  roomMessage?: string;
  socket?: WebSocket;
  connected = false;

  set onConnect(call: (client?: LiveClient) => void) {
    this._callbacks.onConnect = call;
  }

  set onPopularityPacket(
    call: (popularity: number, client?: LiveClient) => void,
  ) {
    this._callbacks.onPopularityPacket = call;
  }

  set onCommandPacket(call: (obj: any, client?: LiveClient) => void) {
    this._callbacks.onCommandPacket = call;
  }

  set onClose(call: (reason: CloseReason, client?: LiveClient) => void) {
    this._callbacks.onClose = call;
  }

  public async launch(): Promise<void> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<void>(async(resolve, _reject) => {
      // 得到原始房间号与主播uid
      let anchorUserId = 0;
      if (this.config.fetchRoomId) {
        const mobileRoom = (await LiveAPI.mobileRoomInit(this.roomId)).data;
        this.roomId = mobileRoom.room_id;
        anchorUserId = mobileRoom.uid;
      }

      // 获取wss地址与端口
      let host = 'broadcastlv.chat.bilibili.com';
      let _port = 443;
      if (this.config.fetchDanmakuConfig) {
        const danmakuConfig = (await LiveAPI.getDanmakuConfig(this.roomId)).data;
        host = danmakuConfig.host;
        for (const server of danmakuConfig.host_server_list) {
          if (server.host === host && server.wss_port) {
            _port = server.wss_port;
            break;
          }
        }
      }

      // 产生历史记录
      if (this.config.doEntryRoomAction && this.bilibiliClient.isLogin)
        LiveAPI.roomEntryAction(this.roomId);

      // 开启 websocket
      const url = `wss://${host}/sub`;
      this.socket = new WebSocket(url);
      this.socket.binaryType = 'arraybuffer';

      this.socket.onopen = (_event) => {
        // 发送进房数据包
        const enterRoomFrame = PresetPacket.enterRoomPacket(
          anchorUserId,
          this.roomId,
        ).toFrame();
        this.socket?.send(enterRoomFrame, {
          binary: true,
          compress: false,
        });
      };
      this.socket.onmessage = async(event) => {
        const packets = await this.frameToBuffer(event.data as ArrayBuffer);
        packets.forEach((packet) => {
          switch (packet.packetType) {
            case PacketType.ENTER_ROOM_RESPONSE:
              this.connected = true;
              this._callbacks.onConnect?.call(this, this);
              break;
            case PacketType.POPULARITY:
              this._callbacks.onPopularityPacket?.call(
                this,
                packet.popularity,
                this,
              );
              break;
            case PacketType.COMMAND:
              this._callbacks.onCommandPacket?.call(this, packet.command, this);
              break;
          }
        });
      };

      if (this.config.sendUserOnlineHeart && this.bilibiliClient.isLogin) {
        this.restHeartBearJob = setInterval(() => {
          LiveAPI.userOnlineHeart(this.roomId);
        }, 300000); // every five minutes
      }

      this.websocketHeartBeatJob = setInterval(() => {
        if (this.connected) {
          const heartbeatFrame = PresetPacket.heartbeatPacket().toFrame();
          this.socket?.send(heartbeatFrame, {
            binary: true,
            compress: false,
          });
        }
      }, 30000); // every half minute

      this.socket.onclose = (event) => {
        if (this.websocketHeartBeatJob)
          clearInterval(this.websocketHeartBeatJob);

        if (this.restHeartBearJob)
          clearInterval(this.restHeartBearJob);

        this.connected = false;
        this._callbacks.onClose?.call(this, event, this);
        resolve();
      };
    });
  }

  public stop() {
    this.socket?.close();
  }

  private async frameToBuffer(frame: ArrayBuffer | Buffer) {
    let buffer: ByteBuffer;
    if (frame instanceof ArrayBuffer)
      buffer = new ByteBuffer(frame);
    else
      buffer = new ByteBuffer(frame.buffer, frame.byteOffset, frame.byteLength);

    const bufferLength = buffer.limit;
    const packets: Packet[] = [];
    while (buffer.pos < bufferLength) {
      const totalLength = buffer.readUint32();
      const headerLength = buffer.readUint16(); // fixed 16
      const protocol = buffer.readUint16(); // current v2
      const packetType = getPacketType(buffer.readUint32());
      const tag = buffer.readUint32();
      const content = buffer.read(totalLength - headerLength);
      if (protocol === 2) {
        const decontent = await new Promise<Buffer>((resolve, _reject) => {
          zlib.inflate(content, (err, buffer) => {
            if (!err)
              resolve(buffer);
          });
        });
        packets.push(...await this.frameToBuffer(decontent));
      } else {
        packets.push(new Packet(protocol, packetType, tag, content));
        if (protocol === 1) { // 长度为 35, 心跳回应占 20, 剩余 15 无法正常解析
          break;
        }
      }
    }
    return packets;
  }
}
