import { AggregateRoot } from "@nestjs/cqrs";
import { AccountCreatedEvent } from "../events/account-created.event";
import { MoneySendedEvent } from "../events/money-sended.event";

export class Account extends AggregateRoot {
    public readonly id: string;
    public readonly money: number;

    // Needed to construct Aggregate from Entity
    // To separe the view (entity read) of the model that can write with events
    constructor(data: Partial<Account> = {}) {
        super();
        Object.assign(this, data)
    }


    createAccount() {
        this.apply(new AccountCreatedEvent(this.id, this.money));
        // La bonne méthode, by the book c'est quoi ? :

        // Créer l'account dans la commande (Mais franchement, faire du write dans la commande c'est pas terrible ? )
        // Créer l'account sur reception de l'event ?

        // Si création de l'account sur event (ce cas):
        // Que ce passe il quand deux account (vérifier okay en command) passe en event creation avec le même accountid ?
        // Est-ce qu'il faudrait pas implémenter un "reserve uuid" dans la command sur un redis (donc exterieur a la vue construite a partir des events)
    }

    sendMoney(receiverAccountId: string, amount: number) {
        this.apply(new MoneySendedEvent(this.id, receiverAccountId, amount));
    }
}