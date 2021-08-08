import { RunPlaybook } from './ansible.mjs'

(async () => {
    const { code, output } = await RunPlaybook('./playbooks/start-vpn');
    console.log(code, output);
})();

