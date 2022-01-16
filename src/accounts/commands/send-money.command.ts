export class SendMoneyCommand {
    constructor(
        public readonly senderAccountId: string,
        public readonly receiverAccountId: string,
        public readonly amount: number,
        public readonly message: string,
    ) { }
}