import { action, makeAutoObservable, runInAction } from 'mobx';
import { ICommand } from './Command';

export type IContext = {
  id: string;
  commands: ICommand[];
  logs: any[];
  responses: IResponse[];
  created: number;
};

type IResponse = {
  type: 'response';
  context: {
    id: string;
  };
  time: number;
  isNavigationRequest: boolean;
  url: string;
  resourceType: string;
  method: string;
  headers: {
    [key: string]: string;
  };
  content: {
    data: any[];
    type: string;
  };
};

class WebsocketHandlerSingleton {
  private websocket: WebSocket | undefined;
  private connected: boolean = false;
  private uri: string | undefined;

  private contexts = new Map<string, IContext>();

  constructor() {
    makeAutoObservable(this);
  }

  try(uri: string) {
    this.connect(uri, {
      onclose: (event) => {
        let wsUri = prompt('Websocket URI', uri);
        // use setTimeout to clear callstack
        setTimeout(() => this.try(wsUri));
      },
    });
  }

  connect(
    uri: string = 'ws://127.0.0.1:4000/websocket',
    options: {
      retry?: boolean;
      onclose?: (event: CloseEvent) => void;
      timeout?: number;
    } = {},
  ) {
    this.uri = uri;
    this.websocket = new WebSocket(this.uri);

    const timeoutTimer = setTimeout(() => {
      this.websocket.close();
    }, options?.timeout ?? 3 * 1000);

    this.websocket.onopen = (event) => {
      clearTimeout(timeoutTimer);
      runInAction(() => (this.connected = true));
    };

    this.websocket.onclose = (event) => {
      runInAction(() => (this.connected = false));

      if (options.retry) {
        setTimeout(() => this.connect(this.uri), 1000);
      }
      if (options.onclose) {
        options.onclose(event);
      }
    };

    this.websocket.onmessage = (event) => {
      let data = JSON.parse(event.data);

      if (Array.isArray(data)) {
        data.forEach((p) => this.receivedPacket(p));
      } else {
        this.receivedPacket(data);
      }
    };
  }

  private receivedPacket(packet) {
    if (packet.type === 'command') {
      this.addCommand(packet);
    } else if (packet.type === 'log') {
      this.addLog(packet);
    } else if (packet.type === 'response') {
      this.addResponse(packet);
    }
  }

  private addCommand(command: ICommand) {
    let context = this.getContext(command.context.id);
    command.context = context;
    context.commands.push(command);
  }

  private addLog(log: ICommand) {
    let context = this.getContext(log.context.id);
    log.context = context;
    context.logs.push(log);
  }

  private addResponse(response: IResponse) {
    let context = this.getContext(response.context.id);
    response.context = context;
    context.responses.push(response);
  }

  getContext(id) {
    if (!this.contexts.has(id)) {
      this.contexts.set(id, {
        id,
        commands: [],
        logs: [],
        responses: [],
        created: Date.now(),
      });
    }

    return this.contexts.get(id);
  }

  getWebsocket() {
    return this.websocket;
  }

  isConnected() {
    return this.connected;
  }

  getContexts() {
    return this.contexts;
  }
}

export const WebsocketHandler = new WebsocketHandlerSingleton();
