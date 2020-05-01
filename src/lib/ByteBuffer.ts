export default class ByteBuffer extends DataView{
  public pos: number;
  public limit: number;
  constructor(buffer: ArrayBuffer){
    super(buffer);
    this.pos = 0;
    this.limit = buffer.byteLength;
  }

  get remain(){
    return this.limit - this.pos;
  }

  public putUint8(value: number) {
    this.setUint8(this.pos, value)
    this.pos += 1;
  }

  public putInt32(value: number){
    this.setInt32(this.pos, value);
    this.pos += 4;
    return this;
  }

  public putInt16(value: number){
    this.setInt16(this.pos, value);
    this.pos += 2;
    return this;
  }

  public put(src: ArrayBuffer){
    if(src.byteLength > this.remain){
      throw new Error(
        'Buffer overflow!'
      )
    }
    const srcView = new Uint8Array(src);
    const len = this.remain;
    for(let i = 0; i < len; i++){
      this.putUint8(srcView[i]);
    }
  }

  public readUint8(){
    const res = this.getUint8(this.pos);
    this.pos += 1;
    return res;
  }

  public readInt32(){
    const res = this.getInt32(this.pos);
    this.pos += 4;
    return res;
  }

  public readInt16() {
    const res = this.getInt16(this.pos);
    this.pos += 2;
    return res;
  }

  public read(length: number){
    if(length > this.remain){
      throw new Error('Read from buffer overflow')
    }
    const target = new ArrayBuffer(length);
    const targetView = new Uint8Array(target);
    for(let i = 0; i < length ; i++){
      targetView[i] = this.readUint8();
    }
    return target;
  }
}