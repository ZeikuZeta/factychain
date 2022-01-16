import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AccountEntity } from "../models/account.entity";
import { GetAccount } from "./get-account.query";

@QueryHandler(GetAccount)
export class GetAccountHandler implements IQueryHandler<GetAccount> {
    constructor(
        @InjectRepository(AccountEntity)
        private repository: Repository<AccountEntity>
    ) { }

    async execute(query: GetAccount): Promise<AccountEntity | undefined> {
        return this.repository.findOne(query.accountId);
    }
}