export class AccountCreatedEvent {
    constructor(
        public readonly accountId: string,
        public readonly amount: number,
    ) { }
}