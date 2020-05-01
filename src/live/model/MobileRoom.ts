export default interface MobileRoom {
  code: number
  msg: string
  message: string
  data: {
    /** 实际房间号 */
    room_id: number
    /** 房间短号 */
    short_id: number
    uid: number
    need_p2p: number
    is_hidden: boolean
    is_locked: boolean
    is_portrait: boolean
    live_status: number
    hidden_till: number
    lock_till: number
    encrypted: boolean
    pwd_verified: boolean
    live_time: number
    /** 若房间短号可用则为1 */
    room_shield: number
    is_sp: number
    special_type: number
  }
}
