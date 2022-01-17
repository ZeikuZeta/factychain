import { CommandHandler, EventPublisher, ICommandHandler } from "@nestjs/cqrs";
import { StoreEventBus } from "src/events/store-event-bus";
import { RebuildAccountsCommand } from "./rebuild-accounts.command";

@CommandHandler(RebuildAccountsCommand)
export class RebuildAccountsHandler implements ICommandHandler<RebuildAccountsCommand> {
    constructor(
        private ebus: StoreEventBus,
    ) { }

    async execute(command: RebuildAccountsCommand) {
        await this.ebus.replayAll();
    }
}
