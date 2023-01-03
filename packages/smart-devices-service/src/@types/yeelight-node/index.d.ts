declare module "yeelight-node" {
  type DeviceProps =
    | "set_power"
    | "set_rgb"
    | "set_ct_abx"
    | "set_hsv"
    | "set_bright";

  class Yeelight {
    constructor({ ip, port }: { ip: string; port: number });

    get_prop(name: string): Promise<string>;

    set_power(value: "on" | "off"): Promise<string>;

    set_rgb(value: [number, number, number]): Promise<string>;

    set_ct_abx(
      kelvin: number,
      animation: string,
      duration: number
    ): Promise<string>;

    set_hsv(
      hue: number,
      saturation: number,
      animation: string,
      duration: number
    ): Promise<string>;

    set_bright(value: number): Promise<string>;
  }
}
