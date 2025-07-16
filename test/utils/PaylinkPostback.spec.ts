
import {PaylinkPostback} from "../../src";

/*
 * Test for the generated model are kept with the rest of the generated model tests.
 * These unit tests are only for functionality added by the wrapper class.
 */

const licenceKey: string = "AAAAAAAA11111111"

const testData = {
    AVSResponse: ' ',
    CSCResponse: ' ',
    address: '',
    amount: 156380,
    authcode: 'A12345',
    authenticationResult: 'Y',
    authorised: 'true',
    cac: 0,
    cac_id: '',
    cardScheme: 'MasterCard Debit',
    cardSchemeId: 'MD',
    card_accountType: 'D',
    card_commercial: true,
    card_consumer: false,
    card_country: '826',
    card_currency: '840',
    cavv: 'AAABB1R1JQAAAFgYBHUlAAAAAAA=',
    country: '',
    currency: 'GBP',
    datetime: '2024-06-30T13:16:24Z',
    digest: 'JgdAj7y97YL1pxrchps5Bw==',
    eci: '5',
    email: '',
    errorcode: '001',
    errorid: '001',
    errormessage: 'Test Transaction',
    expMonth: 7,
    expYear: 2025,
    firstname: '',
    identifier: '000122',
    isAuthorised: true,
    lastname: '',
    maskedPan: 'Mast***0009',
    merchantid: 1,
    mode: 'test',
    name_on_card: 'N E Body',
    postcode: '',
    receipt_url: 'https://payments.citypay.com/V1c/MjU5NDgyMzA0NTIzMDg0NjM4MDc/receipt=K1ws8TE6LpQn9D2YuPbVEfcurWp9UGmcpVuryPaxmQun',
    result: 1,
    sha1: 'R31oAzwWijfTqXKpeEAkNeolt5c=',
    sha256: 'JUv6MYNPTtloAau98b5wvTayQN0IKCeh0jTphS8qMIY=',
    status: 'O',
    title: '',
    transno: 6168
}

describe ("PaylinkPostback ", () => {

    it("should parse json object", async () => {

        const postback = await PaylinkPostback.fromJson(testData, licenceKey)

        expect(postback).toBeInstanceOf(PaylinkPostback);
        expect(postback.get('nameOnCard')).toBe("N E Body");
        expect(postback.get('amount')).toBe(156380);
    })

    it("should parse json string", async () => {
        const postback = await PaylinkPostback.fromJson(JSON.stringify(testData), licenceKey)

        expect(postback).toBeInstanceOf(PaylinkPostback);
        expect(postback.get('nameOnCard')).toBe("N E Body");
        expect(postback.get('amount')).toBe(156380);
    })

    it("should reject incorrect SHA256 signature", async () => {
        var incorrectData = testData;
        incorrectData.sha256 = "AAAAAANPTtloAau98b5wvTayQN0IKCeh0jTphS8qMIY="

        await expect(PaylinkPostback.fromJson(incorrectData, licenceKey))
            .rejects.toThrow("Failed to authenticate data. SHA256 signature does not match.")
    })
})