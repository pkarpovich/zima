import * as process from "node:process";

export interface IConfig {
  Ansible: {
    PlaybooksDir: string;
  };
  Rabbit: {
    Url: string;
    AnsibleQueueName: string;
  };
  VPN: {
    FolderFilesPath: string;
  };
  SSH: {
    Host: string;
    Username: string;
  };
}

export function Config(): IConfig {
  return {
    Ansible: {
      PlaybooksDir: String(process.env.PLAYBOOKS_DIR),
    },

    Rabbit: {
      Url: String(process.env.AMQP_SERVER_URL),
      AnsibleQueueName: String(process.env.AMQP_ANSIBLE_QUEUE_NAME),
    },

    VPN: {
      FolderFilesPath: String(process.env.VPN_FILES_PATH),
    },

    SSH: {
      Host: String(process.env.SSH_HOST),
      Username: String(process.env.SSH_USER),
    },
  };
}
