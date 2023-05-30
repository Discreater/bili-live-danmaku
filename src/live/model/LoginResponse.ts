export interface LoginResponse {
  code: number
  message: string
  data: {
    cookie_info: {
      cookies: {
        expires: number
        http_only: number
      }[]
    }
  }
}
