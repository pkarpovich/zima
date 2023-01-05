import { ConfigService, FilesService } from "shared/services";
import { AnsibleService } from "./ansible-service.js";
import { IConfig } from "../config/config.js";

export class VpnService {
  constructor(
    private readonly ansibleService: AnsibleService,
    private readonly configService: ConfigService<IConfig>,
    private readonly filesService: FilesService
  ) {}

  async start(vpnFileName: string) {
    const [vpnFile] = await this.pickMostPossibleFile(vpnFileName);
    const [vpnFileNameWithoutExt] = vpnFile.split(".");

    const { code, output } = await this.ansibleService.run("start-vpn", {
      vpn_name: vpnFileNameWithoutExt.replace(/(\s+)/g, "\\$1"),
    });

    return {
      code,
      output,
    };
  }

  private async pickMostPossibleFile(location: string) {
    const vpnFolderFilesPath = this.configService.get<string>(
      "VPN.FolderFilesPath"
    );
    const files = await this.filesService.getDirFiles(vpnFolderFilesPath);

    return files.filter((name) =>
      name
        .replace(/[^\w\s]|_/g, "")
        .replace(/\s+/g, " ")
        .toLowerCase()
        .includes(location.toLowerCase())
    );
  }

  async stop() {
    const { code, output } = await this.ansibleService.run("stop-vpn");

    return {
      code,
      output,
    };
  }

  async loadVpnFiles() {
    const { code, output } = await this.ansibleService.run(
      "load-new-vpn-files"
    );

    return {
      code,
      output,
    };
  }
}
