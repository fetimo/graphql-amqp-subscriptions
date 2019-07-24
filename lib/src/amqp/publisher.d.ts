import amqp from 'amqplib';
import Debug from 'debug';
export declare class AMQPPublisher {
    private connection;
    private logger;
    private channel;
    constructor(connection: amqp.Connection, logger: Debug.IDebugger);
    publish(exchange: string, routingKey: string, data: any): Promise<void>;
}
