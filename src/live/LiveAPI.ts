import raw from 'axios';
import type MobileRoom from './model/MobileRoom';
import type DanmakuConfig from './model/DanmakuConfig';

const axios = raw.create();
axios.defaults.baseURL = 'https://api.live.bilibili.com';

export class LiveAPI {
  async mobileRoomInit(id: number): Promise<MobileRoom> {
    const res = await axios.get('/room/v1/Room/mobileRoomInit', {
      params: {
        id,
      },
    });
    return res.data as MobileRoom;
  }

  async getDanmakuConfig(
    roomId: number,
  ): Promise<DanmakuConfig> {
    const res = await axios.get('/room/v1/Danmu/getConf', {
      params: {
        room_id: roomId,
      },
    });
    return res.data as DanmakuConfig;
  }

  /**
   * 进入房间时客户端将访问该接口
   * 访问该接口将在自己的账户中产生一条观看直播的历史记录
   *
   * @param roomId 房间号
   * @param jumpFrom
   */
  async roomEntryAction(roomId: number, jumpFrom = 0) {
    const _res = await axios.post('/room/v1/Room/room_entry_action', {
      room_id: roomId,
      jumpFrom,
    });
  }

  /**
   * 用于确认客户端在看直播的心跳包(与弹幕推送无关)
   * 每五分钟发送一次
   */
  async userOnlineHeart(roomId: number, scale = 'xxhdpi') {
    await axios.post('/mobile/userOnlineHeart', {
      room_id: roomId,
      scale,
    });
  }
}
