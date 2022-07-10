import Ansible from "node-ansible-control";

export class AnsibleService {
  #playbook = null;

  #configService = null;

  constructor({ configService }) {
    this.#configService = configService;

    const playbooksDir = this.#configService.get("Ansible.PlaybooksDir");
    this.#playbook = new Ansible.Playbook().inventory(
      `${playbooksDir}/hosts.yml`
    );
  }

  run(name, variables = {}) {
    const playbooksDir = this.#configService.get("Ansible.PlaybooksDir");
    const playbookName = `${playbooksDir}/playbooks/${name}`;

    return this.#playbook.playbook(playbookName).variables(variables).exec();
  }
}
