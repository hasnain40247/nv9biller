import { SerialPort } from "serialport";
import { pack, unpack } from "python-struct";
import * as ssp from "./ssp"
import crc16 from "crc/crc16";

export class BillerCommunicationsError extends Error {
  constructor(message: string) {
      super(message);
  }
}

export class BillerChannel {
  private value: number;
  private currency: string;

  constructor(value: number, currency: string) {
    this.value = value;
    this.currency = currency;
  }

  public getValue(): number {
    return this.value;
  }

  public getCurrency(): string {
    return this.currency;
  }

  public toString(): string {
    return `${this.value.toFixed(2)} ${this.currency}`;
  }
}

export class BillerEvent {
  private readonly code: number;
  private readonly channel: BillerChannel | undefined;
  private static readonly EVT_DESC: { [key: number]: string } = {
    [ssp.EVT_RESET]: 'Reset',
    [ssp.EVT_READ]: 'Read',
    [ssp.EVT_CREDIT]: 'Credit',
    [ssp.EVT_REJECTING]: 'Rejecting',
    [ssp.EVT_REJECTED]: 'Rejected',
    [ssp.EVT_STACKING]: 'Stacking',
    [ssp.EVT_STACKED]: 'Stacked',
    [ssp.EVT_SAFE_JAM]: 'Safe jam',
    [ssp.EVT_UNSAFE_JAM]: 'Unsafe jam',
    [ssp.EVT_DISABLED]: 'Disabled',
    [ssp.EVT_STACKER_FULL]: 'Stacker full',
    [ssp.EVT_CLEARED_FRONT]: 'Cleared to front',
    [ssp.EVT_CLEARED_CASHBOX]: 'Cleared to cashbox',
    [ssp.EVT_CH_DISABLE]: 'Channels disabled',
    [ssp.EVT_INITIALIZING]: 'Initializing',
    [ssp.EVT_TICKET_BEZEL]: 'Ticket in bezel',
    [ssp.EVT_PRINTED_CASHBOX]: 'Printed to cashbox'
  };

  constructor(code: number, channel?: BillerChannel) {
    this.code = code;
    this.channel = channel;
  }

  public toString(): string {
    let result = `${BillerEvent.EVT_DESC[this.code]}`;
    if (this.channel) {
      result += ` -> ${this.channel}`;
    }
    return result;
  }

  public getCode(): number {
    return this.code;
  }

  public getChannel(): BillerChannel | undefined {
    return this.channel;
  }
}

export class Biller {
  private _RX_STATE_WAIT_STX = 0;
  private _RX_STATE_WAIT_SEQ = 1;
  private _RX_STATE_WAIT_LEN = 2;
  private _RX_STATE_WAIT_DATA = 3;
  private _RX_STATE_WAIT_CRC = 4;
  private _RX_STATE_FINISHED = 5;

  private CH_0 = 0;
  private CH_1 = 1;
  private CH_2 = 2;
  private CH_3 = 3;
  private CH_4 = 4;
  private CH_5 = 5;
  private CH_6 = 6;
  private CH_7 = 7;
  private CH_8 = 8;
  private CH_9 = 9;
  private CH_10 = 10;
  private CH_11 = 11;
  private CH_12 = 12;
  private CH_13 = 13;
  private CH_14 = 14;
  private CH_15 = 15;

  private CH_ALL = [
    this.CH_0,
    this.CH_1,
    this.CH_2,
    this.CH_3,
    this.CH_4,
    this.CH_5,
    this.CH_6,
    this.CH_7,
    this.CH_8,
    this.CH_9,
    this.CH_10,
    this.CH_11,
    this.CH_12,
    this.CH_13,
    this.CH_14,
    this.CH_15,
  ];

  private EVT_RESET = ssp.EVT_ALL[0];
  private EVT_READ = ssp.EVT_ALL[1];
  private EVT_CREDIT = ssp.EVT_ALL[2];
  private EVT_REJECTING = ssp.EVT_ALL[3];
  private EVT_REJECTED = ssp.EVT_ALL[4];
  private EVT_STACKING = ssp.EVT_ALL[5];
  private EVT_STACKED = ssp.EVT_ALL[6];
  private EVT_SAFE_JAM = ssp.EVT_ALL[7];
  private EVT_UNSAFE_JAM = ssp.EVT_ALL[8];
  private EVT_DISABLED = ssp.EVT_ALL[9];
  private EVT_STACKER_FULL = ssp.EVT_ALL[10];
  private EVT_CLEARED_FRONT = ssp.EVT_ALL[11];
  private EVT_CLEARED_CASHBOX = ssp.EVT_ALL[12];
  private EVT_CH_DISABLE = ssp.EVT_ALL[13];
  private EVT_INITIALIZING = ssp.EVT_ALL[14];
  private EVT_TICKET_BEZEL = ssp.EVT_ALL[15];
  private EVT_PRINTED_CASHBOX = ssp.EVT_ALL[16];

  private _sequence: number = 0;
  private _serial: any;
  private _fw_version: any;
  private _channels: BillerChannel[] = [];
  private _crc: any;
  private _s: any;

  constructor(port: string) {
    console.log("connecting");
    console.log(port);
    console.log(ssp.BAUDRATE);
    console.log(ssp.TIMEOUT);

    this._s = new SerialPort({ path: port, baudRate: ssp.BAUDRATE });
    console.log("connected -1");
    this._crc = crc16;

    this._sequence = 0;
    this._sync();
    this._load_settings();
  }

  private _send(command: number, data: Uint8Array = Buffer.alloc(0)): void {
    const pkt = Buffer.concat([
      Buffer.from([this._sequence, 1 + data.length, command]),
      data,
    ]);
    const crcValue = this._crc(pkt);
    const pktWithCRC = Buffer.concat([
      pkt,
      Buffer.from([crcValue & 0xff, (crcValue >> 8) & 0xff]),
    ]);

    const stx = Buffer.from([ssp.STX]);
    const stxDouble = Buffer.concat([stx, stx]);

    const pktWithSTX = Buffer.concat([
      stx,
      ...pktWithCRC.reduce((acc: Buffer[], curr, idx, src) => {
        if (curr === stx[0]) {
          acc.push(stxDouble);
        } else {
          acc.push(Buffer.from([curr]));
        }
        return acc;
      }, []),
    ]);

    this._s.write(pktWithSTX);
  }

  private _transmit(
    command: number,
    data: Uint8Array = new Uint8Array()
  ): Uint8Array {
    this._send(command, data);
    let r = this._recv();
    this._sequence ^= ssp.SEQ;
    return r;
  }

  private _sync(): void {
    this._transmit(ssp.CMD_SYNC);
    this._sequence = 0;
  }

  private _load_settings(): void {
    // request serial
    const r = this._transmit(ssp.CMD_GET_SERIAL);
    this._serial = unpack(">I", Buffer.from(r))[0];

    // request setup
    const s = this._transmit(ssp.CMD_SETUP_REQ);

    this._fw_version = s.slice(1, 1 + 4).toString();

    // process each channel information
    const n_ch = s[11];
    const multiplier:any = unpack(">I", Buffer.from("\x00" + s.slice(8, 8 + 3)))[0];

    this._channels = [];

    for (let ch = 0; ch < n_ch; ch++) {
      let off = 12 + ch;
      const value = s[off] * multiplier;

      off = 16 + n_ch * 2 + ch * 3;
      const currency = s.slice(off, off + 3).toString();

      this._channels.push(new BillerChannel(value, currency));
    }
  }

  get serial(): number {
    return this._serial;
  }

  get fw_version(): string {
    return this._fw_version;
  }

  get channels(): BillerChannel[] {
    return this._channels;
  }

  get counters(): {
    stacked: any;
    stored: any;
    dispensed: any;
    transferred: any;
    rejected: any;
  } {
    const r = this._transmit(ssp.CMD_COUNTERS_GET);
    return {
      stacked: unpack("<I", Buffer.from(r.slice(1, 1 + 4)))[0],
      stored: unpack("<I", Buffer.from(r.slice(5, 5 + 4)))[0],
      dispensed: unpack("<I", Buffer.from(r.slice(9, 9 + 4)))[0],
      transferred: unpack("<I", Buffer.from(r.slice(13, 13 + 4)))[0],
      rejected: unpack("<I", Buffer.from(r.slice(17, 17 + 4)))[0],
    };
  }
  counters_reset(): void {
    /** Reset counters. */
    this._transmit(ssp.CMD_COUNTERS_RST);
  }

  display_enable(): void {
    /** Enable display (leds). */
    this._transmit(ssp.CMD_DISP_EN);
  }
  private _recv() {
    let pkt = Buffer.from([]);
    let pktCounter = 0;
    let state = this._RX_STATE_WAIT_STX;
    let init = Date.now();

    while (state !== this._RX_STATE_FINISHED) {
      if (Date.now() - init > ssp.TIMEOUT) {
        throw new BillerCommunicationsError("Timeout");
      }

      const data = this._s.read();
      if (!data) {
        continue;
      }

      // wait until STX
      if (state === this._RX_STATE_WAIT_STX) {
        if (data.readUInt8(0) === ssp.STX) {
          state = this._RX_STATE_WAIT_SEQ;
        }
      } else {
        // skip stuffed bytes
        if (data.readUInt8(0) === ssp.STX) {
          continue;
        }

        pkt = Buffer.concat([pkt, data]);
        let pktLen = 0;
        // process state
        if (state === this._RX_STATE_WAIT_SEQ) {
          state = this._RX_STATE_WAIT_LEN;
        } else if (state === this._RX_STATE_WAIT_LEN) {
          pktLen = data.readUInt8(0);
          state = this._RX_STATE_WAIT_DATA;
        } else if (state === this._RX_STATE_WAIT_DATA) {
          pktCounter += 1;
          if (pktCounter === pktLen) {
            pktCounter = 0;
            state = this._RX_STATE_WAIT_CRC;
          }
        } else if (state === this._RX_STATE_WAIT_CRC) {
          pktCounter += 1;
          if (pktCounter === ssp.CRC_LEN) {
            state = this._RX_STATE_FINISHED;
          }
        }
      }
    }

    // validate CRC
    let crc = this._crc(pkt.slice(0, -ssp.CRC_LEN));
    if (crc !== pkt.readUInt16LE(pkt.length - ssp.CRC_LEN)) {
      throw new BillerCommunicationsError("CRC mismatch");
    }

    // check for response errors
    let err = pkt[ssp.RESP_FLD];
    if (err !== ssp.ERR_OK) {
      throw new BillerCommunicationsError(ssp.ERR_DESC[err]);
    }

    return pkt.slice(ssp.RESP_FLD + 1, -ssp.CRC_LEN);
  }
}