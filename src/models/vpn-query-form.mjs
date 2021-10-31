import { BaseQueryForm } from "./base-query-form.mjs";
import { TokenTypes } from "../constants/token-types.mjs";
import { Action } from "./action.mjs";

const ActionTypes = {
  Start: "start-vpn",
  Stop: "stop-vpn",
  Status: "vpn-status",
};

export class VpnQueryForm extends BaseQueryForm {
  filesService = null;

  configService = null;

  vpnService = null;

  constructor({ rabbitService, filesService, configService }) {
    super({
      name: "VPN Form",
      globalKeywords: ["vpn"],
      actions: [
        new Action({
          actionType: ActionTypes.Start,
          keywords: ["start"],
          props: [
            {
              name: "VPN location",
              type: TokenTypes.COUNTRY,
              value: null,
              clarifyingQuestion: "In which country turn on VPN?",
            },
          ],
        }),
        new Action({
          actionType: ActionTypes.Stop,
          keywords: ["stop"],
        }),
        new Action({
          actionType: ActionTypes.Status,
          keywords: ["status"],
        }),
      ],
    });

    const actionHandlers = {
      [ActionTypes.Start]: this.startVpnHandler.bind(this),
      [ActionTypes.Stop]: this.stopVpnHandler.bind(this),
      [ActionTypes.Status]: this.vpnStatusHandler.bind(this),
    };

    // eslint-disable-next-line no-restricted-syntax
    for (const action of this.actions) {
      action.handler = actionHandlers[action.actionType];
    }

    this.filesService = filesService;
    this.configService = configService;
    this.rabbitService = rabbitService;
  }

  async startVpnHandler(action, tokens) {
    const location = action.getPropByType(TokenTypes.COUNTRY)?.value;
    const vpnFiles = await this.getLocationVpnFiles(location);

    const tokensAfterLocation = tokens.slice(tokens.indexOf(location));
    const [vpnFilePath] = this.pickMostPossibleFile(
      vpnFiles,
      tokensAfterLocation
    );
    const [vpnFileName] = vpnFilePath.split(".");

    const queueName = this.configService.get("Rabbit.AnsibleQueueName");
    await this.rabbitService.createConnection();
    return this.rabbitService.sendToChannelWithResponse(
      queueName,
      JSON.stringify({ name: "start-vpn", props: { vpnFileName } })
    );
  }

  async stopVpnHandler() {
    const queueName = this.configService.get("Rabbit.AnsibleQueueName");
    await this.rabbitService.createConnection();
    return this.rabbitService.sendToChannelWithResponse(
      queueName,
      JSON.stringify({ name: "stop-vpn", props: {} })
    );
  }

  async vpnStatusHandler() {
    const queueName = this.configService.get("Rabbit.AnsibleQueueName");
    await this.rabbitService.createConnection();
    return this.rabbitService.sendToChannelWithResponse(
      queueName,
      JSON.stringify({ name: "status-vpn", props: {} })
    );
  }

  async getLocationVpnFiles(location) {
    const vpnFolderFilesPath = this.configService.get("VPN.FolderFilesPath");
    const files = await this.filesService.getDirFiles(vpnFolderFilesPath);

    return files.filter((name) =>
      name.toLowerCase().includes(location.toLowerCase())
    );
  }

  pickMostPossibleFile(vpnFiles, tokens) {
    if (vpnFiles.length === 1) {
      return vpnFiles;
    }

    let possibleLocation = [];
    let files = [...vpnFiles];

    for (const token of tokens) {
      possibleLocation = [...possibleLocation, token];
      const filteredFiles = vpnFiles.filter((vpnFile) =>
        vpnFile
          .replace(/[^\w\s]|_/g, "")
          .replace(/\s+/g, " ")
          .includes(possibleLocation.join(" "))
      );

      if (filteredFiles.length && filteredFiles.length < files.length) {
        files = filteredFiles;
      }
    }

    return files;
  }
}
