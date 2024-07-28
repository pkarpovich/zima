type Module = {
    name: string;
    address: string;
    actions: string[];
};

export class DiscoveryService {
    private _modules: Map<string, Module> = new Map();

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
}
