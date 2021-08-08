import Ansible from "node-ansible-control";

export const RunPlaybook = (name, variables = {}) => {
  const playbook = new Ansible.Playbook().playbook(name).variables(variables);

  return playbook.exec();
};
