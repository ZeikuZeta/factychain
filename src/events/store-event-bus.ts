import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { EventBus, ObservableBus } from '@nestjs/cqrs';
import { IEvent, IEventBus } from '@nestjs/cqrs/dist/interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEntity } from './event.entity';

@Injectable()
export class StoreEventBus<EventBase extends IEvent = IEvent>
    extends ObservableBus<EventBase>
    implements IEventBus<EventBase>, OnModuleDestroy {

    constructor(
        private eventbus: EventBus,
        @InjectRepository(EventEntity, 'factychain-events')
        private repository: Repository<EventEntity>
    ) {
        super()
    }

    publish<T extends IEvent>(event: T): void {
        const entity = this.repository.create({
            name: event.constructor.name,
            data: event,
        });

        this.repository
            .save(entity)
            .then(() => this.eventbus.publish(event))
            .catch(err => {
                throw err;
            })
    }

    publishAll(events: IEvent[]): void {
        (events || []).forEach(event => this.publish(event));
    }

    onModuleDestroy() {
        this.eventbus.onModuleDestroy();
    }
}