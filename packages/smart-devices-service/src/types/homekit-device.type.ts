export interface IHomekitDevice {
  ip: string;
  port: number;
  uuid: string;
  name: string;
  username: string;
  pincode: string;
  homekitPort: number;
  hasRGB?: boolean;
  zone?: string;
  defaultValue?: string;
}
