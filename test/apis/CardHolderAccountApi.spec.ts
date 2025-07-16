import * as CityPay from "../../src"
import {expect} from '@jest/globals';
import * as ExpoCrypto from '../../src/lib';

function randomUUID(): string {
    const bytes = ExpoCrypto.getRandomBytes(16);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0'));
    return `${hex[0]}${hex[1]}${hex[2]}${hex[3]}-${hex[4]}${hex[5]}-${hex[6]}${hex[7]}-${hex[8]}${hex[9]}-${hex[10]}${hex[11]}${hex[12]}${hex[13]}${hex[14]}${hex[15]}`;
}
import {getMerchandId, getConfiguration} from "../Configuration";
import {type CardHolderAccount, CardHolderAccountApi, type Exists} from "../../src";


describe('Can run CardHolderAccount calls', () => {
    let cardHolderAccountApi: CardHolderAccountApi;
    let resultCardRegister: CardHolderAccount;
    let resultAccountRetrieve: CardHolderAccount;
    let cardId: string;
    let accountId: string;
    let address1: string | undefined;

    beforeEach(() => {

        cardHolderAccountApi = new CityPay.CardHolderAccountApi(getConfiguration());
    });

    it('should create CardholderAccount', async () => {
        const accountCreateRequest: CityPay.CardHolderAccountApiAccountCreate = {
            account_create: {
                accountId: randomUUID().toString(),
                contact: {
                    address1: "7 Esplanade",
                    area: "St Helier",
                    company: "CityPay Limited",
                    country: "JE",
                    email: "dev@citypay.com",
                    firstname: "Integration",
                    lastname: "Test",
                    postcode: "JE2 3QA"
                }
            }
        }

        accountId = accountCreateRequest.account_create.accountId;
        address1 = accountCreateRequest.account_create.contact?.address1;

        const resultAccountCreate = await cardHolderAccountApi.accountCreate(accountCreateRequest);
        expect(resultAccountCreate.accountId).toBe(accountId);
        expect(resultAccountCreate.contact.address1).toBe(address1);
    });

    it('should check if account exists', async () => {
        const resultAccountExistRequest: Exists = await cardHolderAccountApi.accountExistsRequest({accountid: accountId});
        expect(resultAccountExistRequest.active).toBeTruthy();
    });

    it('should register a card', async () => {
        resultCardRegister = await cardHolderAccountApi.accountCardRegisterRequest({
            accountid: accountId,
            register_card: {
                cardnumber: "4000 0000 0000 0002",
                expmonth: 12,
                expyear: 2030
            }
        });

        expect(resultCardRegister.accountId).toBe(accountId);
        expect(resultCardRegister.contact.address1).toBe(address1);

        if (resultCardRegister.cards) {
            expect(resultCardRegister.cards[0].expmonth).toBe(12);
            expect(resultCardRegister.cards[0].expyear).toBe(2030);
        }
    });

    it('should retrieve account', async () => {
        resultAccountRetrieve = await cardHolderAccountApi.accountRetrieveRequest({accountid: accountId});
        expect(resultAccountRetrieve.accountId).toBe(accountId);
        expect(resultAccountRetrieve.contact.address1).toBe(address1);
    });

    it('should do a charge', async () => {
        if (resultAccountRetrieve.cards) {
            const card = resultAccountRetrieve.cards[0];
            expect(card.expmonth).toBe(12);
            expect(card.expyear).toBe(2030);

            cardId = card.cardId as string;

            const decision = await cardHolderAccountApi.chargeRequest({
                charge_request: {
                    amount: 7801,
                    identifier: randomUUID().toString(),
                    merchantid: getMerchandId(),
                    token: resultAccountRetrieve.cards[0].token as string,
                    csc: "012",
                    threedsecure: {
                        tdsPolicy: "2"
                    }
                }
            });

            expect(decision.authResponse).not.toBeUndefined();
            expect(decision.requestChallenged).toBeUndefined();

            const decisionResponse = decision.authResponse;

            expect(decisionResponse?.resultCode).toBe("001");
            expect(decisionResponse?.identifier).toBe(decision.authResponse?.identifier);
            expect(decisionResponse?.authcode).toBe("A12345");
            expect(decisionResponse?.amount).toBe(7801);
        }
    });

    it('should change status of card', async () => {
        const accountCardStatusResponse = await cardHolderAccountApi.accountCardStatusRequest({
            accountid: accountId,
            card_id: cardId,
            card_status: {cardStatus: "INACTIVE"}
        });

        expect(accountCardStatusResponse.code).toBe("001")
    });

    it('should delete card', async () => {
        const accountCardDeletionResponse = await cardHolderAccountApi.accountCardDeleteRequest({
            accountid: accountId,
            card_id: cardId,
        });

        expect(accountCardDeletionResponse.code).toBe("001")
    });

    it('should change contact of the account', async () => {
        const accountChangeContactResponse = await cardHolderAccountApi.accountChangeContactRequest({
            accountid: accountId,
            contact_details: {
                address1: "Seven Esplanade"
            }
        });

        expect(accountChangeContactResponse.contact.address1).toBe("Seven Esplanade");
    });

    it('should change status of the account', async () => {
        const accountStatusResponse = await cardHolderAccountApi.accountStatusRequest({
            accountid: accountId,
            account_status: {status: "DISABLED"}
        });
        expect(accountStatusResponse.code).toBe("001")
    });

    it('should delete account', async () => {
        const accountDeleteResponse = await cardHolderAccountApi.accountDeleteRequest({accountid: accountId});
        expect(accountDeleteResponse.code).toBe("001")
    });
});
