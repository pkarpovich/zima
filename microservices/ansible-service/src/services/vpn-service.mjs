export class VpnService {
  #ansibleService = null;

  #configService = null;

  #filesService = null;

  constructor({ ansibleService, configService, filesService }) {
    this.#ansibleService = ansibleService;
    this.#configService = configService;
    this.#filesService = filesService;
  }

  async start(vpnFileName) {
    const playbooksDir = this.#configService.get("Ansible.PlaybooksDir");
    const playbookName = `${playbooksDir}/start-vpn`;
    const [vpnFile] = await this.#pickMostPossibleFile(vpnFileName);
    const [vpnFileNameWithoutExt] = vpnFile.split('.')

    const { code, output } = await this.#ansibleService.run(playbookName, {
      vpn_name: vpnFileNameWithoutExt.replace(/(\s+)/g, "\\$1"),
    });

    return {
      code,
      output,
    };
  }

  async #pickMostPossibleFile(location) {
    const vpnFolderFilesPath = this.#configService.get("VPN.FolderFilesPath");
    const files = await this.#filesService.getDirFiles(vpnFolderFilesPath);

    return files.filter((name) =>
      name
        .replace(/[^\w\s]|_/g, "")
        .replace(/\s+/g, " ")
        .toLowerCase()
        .includes(location.toLowerCase())
    );
  }

  async stop() {
    const playbooksDir = this.#configService.get("Ansible.PlaybooksDir");
    const playbookName = `${playbooksDir}/stop-vpn`;

    const { code, output } = await this.#ansibleService.run(playbookName, {});

    return {
      code,
      output,
    };
  }

  status() {
    const playbooksDir = this.#configService.get("Ansible.PlaybooksDir");

    return {
      playbooksDir,
      inProgress: true,
    };
  }
}
