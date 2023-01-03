import Ansible from "node-ansible-control";
import { ConfigService } from "shared/src/services.js";
import { IConfig } from "../config/config.js";

export class AnsibleService {
  private readonly playbook;

  constructor(private readonly configService: ConfigService<IConfig>) {
    const playbooksDir = this.configService.get("Ansible.PlaybooksDir");
    this.playbook = new Ansible.Playbook().inventory(
      `${playbooksDir}/hosts.yml`
    );
  }

  run(name: string, variables: unknown = {}) {
    const playbooksDir = this.configService.get("Ansible.PlaybooksDir");
    const playbookName = `${playbooksDir}/playbooks/${name}`;

    return this.playbook.playbook(playbookName).variables(variables).exec();
  }
}
