import { BaseResponse } from "src/app/core/responses/base.response";
import { EmailsModel } from "../../models/usuarios-empresa/emails.model";

export class ObterEmailsResponse extends BaseResponse {
    emails: EmailsModel[];
}