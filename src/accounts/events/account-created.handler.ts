import { InjectRedis } from "@liaoliaots/nestjs-redis";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Redis } from "ioredis";
import { Repository } from "typeorm";
import { AccountEntity } from "../models/account.entity";
import { AccountCreatedEvent } from "./account-created.event";

@EventsHandler(AccountCreatedEvent)
export class AccountCreatedHandler implements IEventHandler<AccountCreatedEvent> {
    constructor(
        @InjectRepository(AccountEntity) private repository: Repository<AccountEntity>,
        @InjectRedis() private readonly redis: Redis
    ) { }

    async handle(event: AccountCreatedEvent) {
        const account = this.repository.create();
        account.id = event.accountId;
        account.money = event.amount;

        await this.repository.save(account);
        await this.redis.del(account.id);
    }
}
