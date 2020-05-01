import raw from 'axios'
import MobileRoom from './model/MobileRoom'
import DanmakuConfig from './model/DanmakuConfig'

const axios = raw.create()
axios.defaults.baseURL = 'https://api.live.bilibili.com'

export namespace LiveAPI {
  export async function mobileRoomInit(id: number): Promise<MobileRoom> {
    const res = await axios.get('/room/v1/Room/mobileRoomInit', {
      params: {
        id
      }
    })
    return res.data as MobileRoom
  }

  export async function getDanmakuConfig(
    roomId: number
  ): Promise<DanmakuConfig> {
    const res = await axios.get('/room/v1/Danmu/getConf', {
      params: {
        room_id: roomId
      }
    })
    return res.data as DanmakuConfig
  }

  /**
   * 进入房间时客户端将访问该接口
   * 访问该接口将在自己的账户中产生一条观看直播的历史记录
   *
   * @param roomId 房间号
   */
  export async function roomEntryAction(roomId: number, jumpFrom: number = 0) {
    const res = await axios.post('/room/v1/Room/room_entry_action', {
      room_id: roomId,
      jumpFrom
    })
  }

  /**
   * 用于确认客户端在看直播的心跳包(与弹幕推送无关)
   * 每五分钟发送一次
   */
  export async function userOnlineHeart(roomId: number, scale: string = "xxhdpi"){
    await axios.post('/mobile/userOnlineHeart', {
      room_id: roomId,
      scale
    });
  }
}
