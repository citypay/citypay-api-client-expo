import {PaylinkPostbackModel, PaylinkPostbackModelFromJSON} from "../models";
import * as Crypto from "../lib/ExpoCrypto";

export class PaylinkPostback {

    private model: PaylinkPostbackModel;

    constructor(model: PaylinkPostbackModel) {
        this.model = model
    }

    private hasKey(key: PropertyKey): key is keyof PaylinkPostbackModel {
        return key in this.model
    }

    get(field: string): any {
        if (this.hasKey(field)) {
            return this.model[field];

        } else {
            throw new ReferenceError(`Field ${field} does not exist in postback data`)
        }
    }

    static async fromJson(json: any, licenceKey: string): Promise<PaylinkPostback> {

        const data = (typeof json === 'string') ? JSON.parse(json) : json

        const model: PaylinkPostbackModel = PaylinkPostbackModelFromJSON(data)

        let base = '';

        const errorcode = model.errorcode;
        const i = errorcode.indexOf(".");

        let ec: string;
        if (i > -1) {
            ec = errorcode.substring(0, i);
        } else {
            ec = errorcode;
        }

        base += model.authcode;
        base += model.amount.toString();
        base += ec;
        base += model.merchantid.toString();
        base += model.transno.toString();
        base += model.identifier;
        base += licenceKey;

        const calculatedSha = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            base,
            { encoding: Crypto.CryptoEncoding.BASE64 }
        );

        if (calculatedSha === model.sha256) {
            return new PaylinkPostback(model)

        } else {
            throw new RangeError("Failed to authenticate data. SHA256 signature does not match.")
        }
    }
}