import { describe, beforeEach, it } from "node:test";
import * as assert from "node:assert";
import { DiscoveryClientService } from "shared/services";

const discoveryClientService = {};

import { DiscoveryService } from "./discovery.service.js";

describe("DiscoveryService", () => {
    let discoveryService: DiscoveryService;

    beforeEach(() => {
        discoveryService = new DiscoveryService(discoveryClientService as unknown as DiscoveryClientService);
    });

    it("should register a module", () => {
        const module = { name: "test", address: "http://localhost:3000", actions: [] };
        discoveryService.register(module);

        assert.equal(discoveryService.getModule("test"), module);
    });

    it("should deregister a module", () => {
        const module = { name: "test", address: "http://localhost:3000", actions: [] };
        discoveryService.register(module);
        discoveryService.deregister("test");

        assert.equal(discoveryService.getModule("test"), null);
    });

    it("should get a module", () => {
        const module = { name: "test", address: "http://localhost:3000", actions: [] };
        discoveryService.register(module);

        assert.equal(discoveryService.getModule("test"), module);
    });

    it("should return undefined if module is not found", () => {
        assert.equal(discoveryService.getModule("test"), null);
    });

    it("should return undefined if module is deregistered", () => {
        const module = { name: "test", address: "http://localhost:3000", actions: [] };
        discoveryService.register(module);
        assert.equal(discoveryService.getModule("test"), module);

        discoveryService.deregister("test");

        assert.equal(discoveryService.getModule("test"), null);
    });

    it("should get a module by action", () => {
        const module = { name: "test", address: "http://localhost:3000", actions: ["test"] };
        discoveryService.register(module);

        assert.equal(discoveryService.getModuleByAction("test"), module);
    });

    it("should return undefined if module is not found by action", () => {
        assert.equal(discoveryService.getModuleByAction("test"), null);
    });

    it("should return all modules", () => {
        const module1 = { name: "test1", address: "http://localhost:3000", actions: [] };
        const module2 = { name: "test2", address: "http://localhost:3000", actions: [] };
        discoveryService.register(module1);
        discoveryService.register(module2);

        assert.deepEqual(discoveryService.getModules(), [module1, module2]);
        assert.equal(discoveryService.getModules().length, 2);
    });

    it("should return an empty array if no modules are registered", () => {
        assert.deepEqual(discoveryService.getModules(), []);
        assert.equal(discoveryService.getModules().length, 0);
    });
});
