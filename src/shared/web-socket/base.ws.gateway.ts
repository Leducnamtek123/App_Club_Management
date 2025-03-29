import {
    WebSocketGateway,
    WebSocketServer,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { Injectable, Logger } from '@nestjs/common';
  
  @WebSocketGateway({ cors: false })
  @Injectable()
  export abstract class BaseWsGateway {
    @WebSocketServer()
    server?: Server;
  
    protected logger: Logger;
  
    constructor(context: string) {
      this.logger = new Logger(context);
    }
  
    handleConnection(client: Socket) {
      this.logger.log(`Client connected to: ${client.id}`);
      
    }
  
    handleDisconnect(client: Socket) {
      this.logger.log(`Client disconnected: ${client.id}`);
    }
  
    // Gửi thông báo chung đến tất cả client
    sendNotification(event: string, data: any) {
      this.server?.emit(event, data);
    }
  
    // Gửi thông báo đến một client cụ thể
    sendToClient(clientId: string, event: string, data: any) {
      this.server?.to(clientId).emit(event, data);
    }
  }
  