import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateTransactionDto {
    @IsNotEmpty()
    senderAccountId: string;

    @IsNotEmpty()
    amount: number;

    @IsNotEmpty()
    receiverAccountId: string;

    @IsOptional()
    msg: string;
}