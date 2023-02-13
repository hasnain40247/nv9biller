export const BAUDRATE = 9600;
/** int: Baudrate (bps). */
export const TIMEOUT = 1;
/** int: Timeout (s). */

export const CRC_POLY = 0x18005;
/** int: CRC polynomial (CRC16-IBM). */
export const CRC_INIT = 0xFFFF;
/** int: CRC initialization value. */
export const CRC_LEN = 2;
/** int: CRC length (bytes). */

export const STX = 0x7F;
/** int: STX (start) byte value. */
export const SEQ = 0x80;
/** int: Sequence flag. */

export const RESP_FLD = 2;
/** int: Response code byte in the response. */

export const ERR_OK = 0xF0;
/** int: Error code, OK. */
export const ERR_NOTKNOWN = 0xF2;
/** int: Error code, command not known. */
export const ERR_NOPARAM = 0xF3;
/** int: Error code, incorrect number of parameters. */
export const ERR_RANGE = 0xF4;
/** int: Error code, one of the parameters is out of range. */
export const ERR_PROCESS = 0xF5;
/** int: Error code, command could not be processed. */
export const ERR_SW = 0xF6;
/** int: Error code, software error. */
export const ERR_FAIL = 0xF8;
/** int: Error code, general failure. */
export const ERR_KEY = 0xFA;
/** int: Error code, encryption keys not negotiated. */

export const ERR_DESC: { [key: number]: string } = {
  [ERR_NOTKNOWN]: 'Command not known',
  [ERR_NOPARAM]: 'Incorrect number of parameters',
  [ERR_RANGE]: 'One of the parameters is out of range',
  [ERR_PROCESS]: 'Command could not be processed',
  [ERR_SW]: 'Software error',
  [ERR_FAIL]: 'General failure',
  [ERR_KEY]: 'Encryption keys not negotiated'
};
/** dict: Error codes descriptions. */

export const EVT_RESET = 0xF1;
export const EVT_READ = 0xEF;
export const EVT_CREDIT = 0xEE;
export const EVT_REJECTING = 0xED;
export const EVT_REJECTED = 0xEC;
export const EVT_STACKING = 0xCC;
export const EVT_STACKED = 0xEB;
export const EVT_SAFE_JAM = 0xEA;
export const EVT_UNSAFE_JAM = 0xE9;
export const EVT_DISABLED = 0xE8;
export const EVT_STACKER_FULL = 0xE7;
export const EVT_CLEARED_FRONT = 0xE1;
export const EVT_CLEARED_CASHBOX = 0xE2;
export const EVT_CH_DISABLE = 0xB5;
export const EVT_INITIALIZING = 0xB6;
export const EVT_TICKET_BEZEL = 0xAD;
export const EVT_PRINTED_CASHBOX = 0xAF;

export const CMD_CH_INHIBITS: number = 0x02;
/** int: Command, channel inhibits. */

export const CMD_DISP_EN: number = 0x03;
/** int: Command, display enable. */

export const CMD_DISP_DIS: number = 0x04;
/** int: Command, display disable. */

export const CMD_SETUP_REQ: number = 0x05;
/** int: Command, setup request. */

export const CMD_POLL: number = 0x07;
/** int: Command, poll. */

export const CMD_REJECT: number = 0x08;
/** int: Command, reject. */

export const CMD_DISABLE: number = 0x09;
/** int: Command, disable. */

export const CMD_ENABLE: number = 0x0A;
/** int: Command, enable. */

export const CMD_GET_SERIAL: number = 0x0C;
/** int: Command, get serial. */

export const CMD_SYNC: number = 0x11;
/** int: Command, sync. */

export const CMD_HOLD: number = 0x18;
/** int: Command, hold. */

export const CMD_COUNTERS_GET: number = 0x58;
/** int: Command, counters get. */

export const CMD_COUNTERS_RST: number = 0x59;
/** int: Command, counters reset. */

export const EVT_ALL = [EVT_RESET, EVT_READ, EVT_CREDIT, EVT_REJECTING, EVT_REJECTED,
    EVT_STACKING, EVT_STACKED, EVT_SAFE_JAM, EVT_UNSAFE_JAM,
    EVT_DISABLED, EVT_STACKER_FULL, EVT_CLEARED_FRONT,
    EVT_CLEARED_CASHBOX, EVT_CH_DISABLE, EVT_INITIALIZING,
    EVT_TICKET_BEZEL, EVT_PRINTED_CASHBOX];
    
    /** tuple: All events. */