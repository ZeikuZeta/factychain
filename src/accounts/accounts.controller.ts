import { Body, Controller, Get, Logger, NotFoundException, Param, Post, Put } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAccountCommand } from "./commands/create-account.command";
import { RebuildAccountsCommand } from "./commands/rebuild-accounts.command";
import { SendMoneyCommand } from "./commands/send-money.command";
import { CreateAccountDto } from "./dto/create-account.dto";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { AccountEntity } from "./models/account.entity";
import { GetAccount } from "./queries/get-account.query";
import { GetAccounts } from "./queries/get-accounts.query";

@Controller('accounts')
export class AccountsController {
    private readonly logger = new Logger('AccountsController');

    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,

    ) { }

    @Get()
    async getAccounts(): Promise<AccountEntity[]> {
        return this.queryBus.execute(new GetAccounts());
    }

    @Post(':id')
    async createAccount(@Param('id') id: string, @Body() dto: CreateAccountDto) {
        return this.commandBus.execute(new CreateAccountCommand(id, dto.amount));
    }

    @Get(':id')
    async getAccount(@Param('id') id: string): Promise<AccountEntity> {
        const account: AccountEntity | undefined = await this.queryBus.execute(new GetAccount(id));

        if (account === undefined) {
            throw new NotFoundException();
        }

        return account;
    }

    @Post('transactions')
    async createTransaction(@Body() dto: CreateTransactionDto) {
        return this.commandBus.execute(new SendMoneyCommand(dto.senderAccountId, dto.receiverAccountId, dto.amount, dto.msg || ""));
    }

    @Post('replay')
    async replayAllEvents() {
        return this.commandBus.execute(new RebuildAccountsCommand());
    }
}