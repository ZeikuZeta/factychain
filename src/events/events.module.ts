import { DynamicModule, Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventEntity } from "./event.entity";
import { StoreEventBus } from "./store-event-bus";
import { StoreEventPublisher } from "./store-event-publisher";

export function createEventSourcingProviders() {
    return [StoreEventBus, StoreEventPublisher];
}

@Module({})
export class EventsModule {
    static forRoot(): DynamicModule {
        return {
            module: EventsModule,
            imports: [
                TypeOrmModule.forRoot({
                    name: 'factychain-events',
                    type: 'postgres',
                    host: 'localhost',
                    port: 5432,
                    username: 'postgres',
                    password: 'postgres-password',
                    database: 'factychain_events',
                    entities: [EventEntity],
                    synchronize: true,
                })
            ],
            exports: [TypeOrmModule],
            global: true,
        }
    }

    static forFeature(): DynamicModule {
        const providers = createEventSourcingProviders();
        return {
            module: EventsModule,
            imports: [TypeOrmModule.forFeature([EventEntity], 'factychain-events'), CqrsModule],
            providers: providers,
            exports: providers,
        }
    }
}