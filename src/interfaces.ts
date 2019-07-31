/* istanbul ignore file */
import amqp from 'amqplib';

export interface QueueOptions {
  name?: string,
  durable?: boolean,
  exclusive?: boolean,
  autoDelete?: boolean,
  arguments?: any
} 

export interface ExchangeOptions {
  durable?: boolean,
  internal?: boolean,
  autoDelete?: boolean,
  alternateExchange?: string,
  arguments?: any
} 

export interface PubSubAMQPOptions {
  connection: amqp.Connection;
  exchange?: string;
  exchangeType?: string;
  queueName?: string; 
  queueOptions?: {};
  exchangeOptions?: {};
}
