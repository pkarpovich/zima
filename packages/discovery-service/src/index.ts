import { DiscoveryService } from "./services/discovery.service.js";

const discoveryService = new DiscoveryService();

discoveryService.register({
    name: "spotify-service",
    address: "http://localhost:3001",
});

discoveryService.register({
    name: "smart-devices-service",
    address: "http://localhost:3002",
});

discoveryService.getModule("spotify-service");
