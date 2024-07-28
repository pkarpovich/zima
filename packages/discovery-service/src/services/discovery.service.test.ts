import { describe, beforeEach, it } from "node:test";
import * as assert from "node:assert";

import { DiscoveryService } from "./discovery.service.js";

describe("DiscoveryService", () => {
    let discoveryService: DiscoveryService;

    beforeEach(() => {
        discoveryService = new DiscoveryService();
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
});
