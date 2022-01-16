export class CreateAccountCommand {
    constructor(
        public readonly accountId: string,
        public readonly amount: number,
    ) { }
}