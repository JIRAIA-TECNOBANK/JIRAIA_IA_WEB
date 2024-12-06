export class ErrorMessage {
    code: string;
    message: string;
    propertyName: string;

    constructor(code: string, message: string, propertyName: string = '') {
        this.code = code;
        this.message = message;
        this.propertyName = propertyName;
    }
}