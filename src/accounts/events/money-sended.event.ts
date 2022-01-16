export class MoneySendedEvent {
    constructor(
        public readonly senderAccountId: string,
        public readonly receiverAccountId: string,
        public readonly amount: number,
    ) { }
}