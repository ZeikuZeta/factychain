import { InjectRedis } from "@liaoliaots/nestjs-redis";
import { BadRequestException, ConflictException, Inject } from "@nestjs/common";
import { CommandHandler, EventPublisher, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Redis } from "ioredis";
import { StoreEventBus } from "src/events/store-event-bus";
import { Repository } from "typeorm";
import { AccountCreatedEvent } from "../events/account-created.event";
import { AccountEntity } from "../models/account.entity";
import { CreateAccountCommand } from "./create-account.command";

@CommandHandler(CreateAccountCommand)
export class CreateAccountHandler implements ICommandHandler<CreateAccountCommand> {
    constructor(
        private ebus: StoreEventBus,
        @InjectRepository(AccountEntity) private repository: Repository<AccountEntity>,
        @InjectRedis() private readonly redis: Redis
    ) { }

    async execute(command: CreateAccountCommand) {
        const accountEntity = await this.repository.findOne(command.accountId);

        if (accountEntity !== undefined) {
            throw new ConflictException("accountId already exist");
        }

        // Check reservation unique id
        if (await this.redis.get(command.accountId)) {
            throw new ConflictException("accountId already exist");
        }

        // Do reservation (to be deleted in account-created-event)
        await this.redis.set(command.accountId, "");

        this.ebus.publish(new AccountCreatedEvent(command.accountId, command.amount));
    }
}
