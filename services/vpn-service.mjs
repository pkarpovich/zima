export class VpnService {
  #ansibleService = null;

  #configService = null;

  constructor({ ansibleService, configService }) {
    this.#ansibleService = ansibleService;
    this.#configService = configService;
  }

  async start(vpnName) {
    const playbooksDir = this.#configService.get("Ansible.PlaybooksDir");
    const playbookName = `${playbooksDir}/start-vpn`;

    const { code, output } = await this.#ansibleService.run(playbookName, {
      vpn_name: vpnName,
    });

    return {
      code,
      output,
    };
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
