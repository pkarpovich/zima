declare module "node-ansible-control" {
  type ExecResult = {
    code: number;
    output: string;
  };

  class Playbook {
    constructor();

    inventory(inventory: string): this;

    playbook(playbook: string): this;

    variables(variables: unknown): this;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exec(): Promise<ExecResult>;
  }
}
