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
    const playbook = this.#playbook.playbook(name).variables(variables);

    return playbook.exec();
  }
}
