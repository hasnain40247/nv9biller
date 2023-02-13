import { logValue } from "../utils/logger/logValue.utils";

export class Biller {
  private serial = 9211;
  private CH_ALL = -1;

  constructor(private port: string) {
    logValue("Biller_STUB: Inintilizing Biller Stub module");
logValue(`Biller_STUB: Port ${port}`);
  }

  public enable() {
    logValue("Biller_STUB: enable called");
  }

  public disable() {
logValue("Biller_STUB: disable called");
  }

  public async poll() {
    await new Promise((f) => setTimeout(f, 5000));

    logValue("Biller_STUB: poll called");
    return ["Credit = 5.00"]; //dummy return statement
  }

  public display_disable() {
   logValue("Biller_STUB:  display_disable called");
  }

  public display_enable() {
   logValue("Biller_STUB:  display_enable called");
  }

  public channels_set(arg: any) {
   logValue(
      `Biller_STUB:  channels_set called with args ${arg}`
    );
  }
}
