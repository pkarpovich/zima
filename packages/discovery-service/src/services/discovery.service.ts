type Module = {
    name: string;
    address: string;
};

export class DiscoveryService {
    private _modules: Map<string, Module> = new Map();

    register(module: Module) {
        this._modules.set(module.name, module);
    }

    deregister(name: string) {
        this._modules.delete(name);
    }

    getModule(name: string) {
        return this._modules.get(name);
    }
}
