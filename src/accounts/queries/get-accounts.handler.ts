import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AccountEntity } from "../models/account.entity";
import { GetAccounts } from "./get-accounts.query";

@QueryHandler(GetAccounts)
export class GetAccountsHandler implements IQueryHandler<GetAccounts> {
    constructor(
        @InjectRepository(AccountEntity)
        private repository: Repository<AccountEntity>
    ) { }

    async execute(query: GetAccounts): Promise<AccountEntity[]> {
        return this.repository.find()
    }
}