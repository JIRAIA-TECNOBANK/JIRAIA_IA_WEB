import { BaseResponse } from "src/app/core/responses/base.response";

export class RedefinirCredenciaisResponse extends BaseResponse {
  id: number;
  apiKey: string;
  secret: string;
  ambiente: boolean;
}