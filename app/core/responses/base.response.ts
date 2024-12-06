import { ErrorMessage } from "./error-message";

export abstract class BaseResponse {

    errors?: ErrorMessage[] = [];

    addError(code: string, message: string, propertyName: string = '') {
        const errors = this.errors
        if (errors) errors.push(new ErrorMessage(code, message, propertyName))
    }

    get isSuccessful() {
        return this.errors.length == 0;
    }
}