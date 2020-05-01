export default class BilibiliClient {
  constructor(){}

  loginResponse?: string;
  get isLogin() {
    return this.loginResponse != undefined
  }
}