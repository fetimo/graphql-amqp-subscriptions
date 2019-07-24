import amqp from 'amqplib';
export declare class Logger {
    static convertMessage(msg: amqp.ConsumeMessage | null): any;
}
