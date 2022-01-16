import { BadRequestException, ConflictException, Inject } from "@nestjs/common";
import { CommandHandler, EventPublisher, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { StoreEventBus } from "src/events/store-event-bus";
import { StoreEventPublisher } from "src/events/store-event-publisher";
import { Repository } from "typeorm";
import { AccountCreatedEvent } from "../events/account-created.event";
import { AccountEntity } from "../models/account.entity";
import { Account } from "../models/account.model";
import { CreateAccountCommand } from "./create-account.command";

@CommandHandler(CreateAccountCommand)
export class CreateAccountHandler implements ICommandHandler<CreateAccountCommand> {
    constructor(
        private publisher: StoreEventPublisher,
        private ebus: StoreEventBus,
        @InjectRepository(AccountEntity)
        private repository: Repository<AccountEntity>,
    ) { }

    async execute(command: CreateAccountCommand) {
        const accountEntity = await this.repository.findOne(command.accountId);

        if (accountEntity !== undefined) {
            throw new ConflictException("accountId already exist");
        }

        this.ebus.publish(new AccountCreatedEvent(command.accountId, command.amount));
    }
}
