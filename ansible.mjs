import Ansible from "node-ansible-control";

export const RunPlaybook = (name) => {
  const playbook = new Ansible.Playbook().playbook(name);

  return playbook.exec();
};
