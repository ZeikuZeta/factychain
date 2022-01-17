import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccountsController } from "./accounts.controller";
import { CreateAccountHandler } from "./commands/create-account.handler";
import { RebuildAccountsHandler } from "./commands/rebuild-accounts.handler";
import { SendMoneyHandler } from "./commands/send-money.handler";
import { AccountCreatedHandler } from "./events/account-created.handler";
import { MoneySendedHandler } from "./events/money-sended.handler";
import { AccountEntity } from "./models/account.entity";
import { GetAccountHandler } from "./queries/get-account.handler";
import { GetAccountsHandler } from "./queries/get-accounts.handler";

export const CommandHandlers = [CreateAccountHandler, SendMoneyHandler, RebuildAccountsHandler];
export const EventHandlers = [AccountCreatedHandler, MoneySendedHandler];
export const QueryHandlers = [GetAccountHandler, GetAccountsHandler];

@Module({
    imports: [TypeOrmModule.forFeature([AccountEntity]), CqrsModule],
    providers: [
        ...CommandHandlers,
        ...EventHandlers,
        ...QueryHandlers,
    ],
    controllers: [AccountsController]
})
export class AccountsModule { }