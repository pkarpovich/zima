import { DiscoveryClientService } from "shared/services";

type Module = {
    name: string;
    address: string;
    actions: string[];
};

export class DiscoveryService {
    private _modules: Map<string, Module> = new Map();

    constructor(private readonly discoveryClientService: DiscoveryClientService) {}

    register(module: Module) {
        this._modules.set(module.name, module);
    }

    deregister(name: string) {
        this._modules.delete(name);
    }

    getModule(name: string): Module | null {
        return this._modules.get(name) ?? null;
    }

    getModuleByAction(action: string): Module | null {
        return Array.from(this._modules.values()).find((module) => module.actions.includes(action)) ?? null;
    }

    getModules(): Module[] {
        return Array.from(this._modules.values());
    }

    pingAllModules() {
        console.log("Pinging all modules");
        this.getModules().forEach((module) => this.pingModule(module.name));
    }

    async pingModule(name: string) {
        const module = this.getModule(name);

        if (!module) {
            return;
        }

        const isActive = await this.discoveryClientService.ping(module.address);
        if (!isActive) {
            this.deregister(name);
        }
    }
}
