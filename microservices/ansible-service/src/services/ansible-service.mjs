import Ansible from "node-ansible-control";

export class AnsibleService {
  #playbook = null;

  constructor() {
    this.#playbook = new Ansible.Playbook();
  }

  run(name, variables = {}) {
    const playbook = this.#playbook.playbook(name).variables(variables);

    return playbook.exec();
  }
}
