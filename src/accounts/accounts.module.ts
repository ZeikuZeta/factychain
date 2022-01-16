import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventsModule } from "src/events/events.module";
import { AccountsController } from "./accounts.controller";
import { CreateAccountHandler } from "./commands/create-account.handler";
import { SendMoneyHandler } from "./commands/send-money.handler";
import { AccountCreatedHandler } from "./events/account-created.handler";
import { MoneySendedHandler } from "./events/money-sended.handler";
import { AccountEntity } from "./models/account.entity";
import { GetAccountHandler } from "./queries/get-account.handler";
import { GetAccountsHandler } from "./queries/get-accounts.handler";

export const CommandHandlers = [CreateAccountHandler, SendMoneyHandler];
export const EventHandlers = [AccountCreatedHandler, MoneySendedHandler];
export const QueryHandlers = [GetAccountHandler, GetAccountsHandler];

@Module({
    imports: [EventsModule.forFeature(), TypeOrmModule.forFeature([AccountEntity]), CqrsModule],
    providers: [
        ...CommandHandlers,
        ...EventHandlers,
        ...QueryHandlers,
    ],
    controllers: [AccountsController]
})
export class AccountsModule { }