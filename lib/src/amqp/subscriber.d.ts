import amqp from 'amqplib';
import Debug from 'debug';
export declare class AMQPSubscriber {
    private connection;
    private logger;
    private channel;
    constructor(connection: amqp.Connection, logger: Debug.IDebugger);
    subscribe(exchange: string, routingKey: string, exchangeType: string | undefined, queueName: string | undefined, exchangeOptions: object | undefined, queueOptions: object | undefined, action: (routingKey: string, message: any) => void): Promise<() => PromiseLike<any>>;
}
