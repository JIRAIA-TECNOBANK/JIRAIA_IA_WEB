import { BaseResponse } from "src/app/core/responses/base.response";

export class EnviarCredenciaisResponse extends BaseResponse {
  id: number;
  emailsRecebemNotificacao: string[];
  ambiente: number;
}