export default interface DanmakuConfig {
  code: number
  msg: string
  message: string
  data: {
    refresh_row_factor: number
    refresh_rate: number
    max_delay: number
    port: number
    host: string
    host_server_list: HostServer[]
    server_list: ServerList[]
    token: string
  }
}

interface HostServer {
  host: string
  port: number
  wss_port: number
  ws_port: number
}

interface ServerList {
  host: string
  port: number
}
