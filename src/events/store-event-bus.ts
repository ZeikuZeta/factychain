import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { CommandBus, EventBus, EventHandlerType, ObservableBus } from '@nestjs/cqrs';
import { IEvent, IEventBus, IEventHandler } from '@nestjs/cqrs/dist/interfaces';
import { EVENTS_HANDLER_METADATA } from '@nestjs/cqrs/dist/decorators/constants';
import { defaultGetEventName } from '@nestjs/cqrs/dist/helpers/default-get-event-name';
import { InjectRepository } from '@nestjs/typeorm';
import { connect, JSONCodec, NatsConnection, Subscription } from 'nats';
import { Repository } from 'typeorm';
import { EventEntity } from './event.entity';
import { filter } from 'rxjs';

@Injectable()
export class StoreEventBus<EventBase extends IEvent = IEvent>
    extends ObservableBus<EventBase>
    implements IEventBus<EventBase>, OnModuleDestroy, OnModuleInit {

    private natsConnection: NatsConnection;
    private readonly logger = new Logger('StoreEventBus');
    private subscriptions: Subscription[];
    protected getEventName: (event: EventBase) => string;

    constructor(
        @InjectRepository(EventEntity, 'factychain-events')
        private repository: Repository<EventEntity>,
        private readonly commandBus: CommandBus,
        private readonly moduleRef: ModuleRef
    ) {
        super()
        this.subscriptions = [];
        this.getEventName = defaultGetEventName;
    }

    async onModuleInit() {
        this.natsConnection = await connect({
            servers: "nats://localhost:4222",

        })
        this.logger.log("NATS connected");
    }

    publish<T extends EventBase>(event: T): void {
        const codec = JSONCodec();

        const eventName = this.getEventName(event);

        const entity = this.repository.create({
            name: eventName,
            data: event,
        });

        this.repository
            .save(entity)
            .then(() => {
                this.natsConnection.publish(eventName, codec.encode(event));
            })
            .catch(err => {
                throw err;
            })
    }

    publishAll(events: EventBase[]): void {
        (events || []).forEach(event => this.publish(event));
    }

    bind(handler: IEventHandler<EventBase>, name: string) {
        const codec = JSONCodec();
        const subscription = this.natsConnection.subscribe(name, {
            queue: 'factychain-writer',
            callback: (err, msg) => {
                if (err) {
                    this.logger.error(err.message);
                } else {
                    const event = codec.decode(msg.data);
                    handler.handle(event as EventBase).then(() => {
                        msg.respond();
                    });
                }
            }
        });
        this.subscriptions.push(subscription);
    }

    onModuleDestroy() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    register(handlers: EventHandlerType<EventBase>[] = []) {
        this.logger.log("REGISTER handlers..");
        handlers.forEach((handler) => this.registerHandler(handler));
    }

    async replayAll() {
        const codec = JSONCodec();
        const events = await this.repository.find({ order: { created_at: "ASC" } });

        for (const event of events) {
            await this.natsConnection.request(event.name, codec.encode(event.data));
        }
    }

    protected registerHandler(handler: EventHandlerType<EventBase>) {
        const instance = this.moduleRef.get(handler, { strict: false });
        if (!instance) {
            return;
        }
        const eventsNames = this.reflectEventsNames(handler);
        eventsNames.map((event) =>
            this.bind(instance as IEventHandler<EventBase>, event.name),
        );
    }

    private reflectEventsNames(
        handler: EventHandlerType<EventBase>,
    ): FunctionConstructor[] {
        return Reflect.getMetadata(EVENTS_HANDLER_METADATA, handler);
    }

    protected ofEventName(name: string) {
        return this.subject$.pipe(
            filter((event) => this.getEventName(event) === name),
        );
    }
}