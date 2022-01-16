import { ConflictException } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AccountEntity } from "../models/account.entity";
import { MoneySendedEvent } from "./money-sended.event";

@EventsHandler(MoneySendedEvent)
export class MoneySendedHandler implements IEventHandler<MoneySendedEvent> {
    constructor(
        @InjectRepository(AccountEntity)
        private repository: Repository<AccountEntity>
    ) { }

    async handle(event: MoneySendedEvent) {
        const from = await this.repository.findOne(event.senderAccountId);
        const to = await this.repository.findOne(event.receiverAccountId);

        if (from === undefined || to === undefined) {
            throw new ConflictException();
        }

        from.money -= event.amount;
        to.money += event.amount;

        await this.repository.save([from, to]);
    }
}
