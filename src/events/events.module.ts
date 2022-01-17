import { DynamicModule, Module, OnApplicationBootstrap, OnModuleInit } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventEntity } from "./event.entity";
import { StoreEventBus } from "./store-event-bus";
import { StoreEventPublisher } from "./store-event-publisher";
import { StoreExplorerService } from "./store-explorer.service";

export function createEventSourcingProviders() {
    return [StoreEventBus, StoreEventPublisher, StoreExplorerService];
}

@Module({})
export class EventsModule {
    constructor(
        private readonly explorerService: StoreExplorerService,
        private readonly eventsBus: StoreEventBus,
    ) { }

    onApplicationBootstrap() {
        const { events } = this.explorerService.explore();

        this.eventsBus.register(events);
    }

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
                }),
                TypeOrmModule.forFeature([EventEntity], 'factychain-events'),
                CqrsModule
            ],
            providers: [StoreExplorerService, StoreEventBus, StoreEventPublisher],
            exports: [TypeOrmModule, StoreEventBus, StoreEventPublisher],
            global: true,
        }
    }
}