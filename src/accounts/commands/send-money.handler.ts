import { NotFoundException } from "@nestjs/common";
import { CommandHandler, EventPublisher, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { StoreEventPublisher } from "src/events/store-event-publisher";
import { Repository } from "typeorm";
import { AccountEntity } from "../models/account.entity";
import { Account } from "../models/account.model";
import { SendMoneyCommand } from "./send-money.command";

@CommandHandler(SendMoneyCommand)
export class SendMoneyHandler implements ICommandHandler<SendMoneyCommand> {
    constructor(
        private publisher: StoreEventPublisher,
        @InjectRepository(AccountEntity)
        private repository: Repository<AccountEntity>,
    ) { }

    async execute(command: SendMoneyCommand) {
        const accountEntity = await this.repository.findOne(command.senderAccountId);

        if (accountEntity === undefined) {
            throw new NotFoundException();
        }

        const account = this.publisher.mergeObjectContext(new Account(accountEntity));
        account.sendMoney(command.receiverAccountId, command.amount);
        account.commit();
    }
}
