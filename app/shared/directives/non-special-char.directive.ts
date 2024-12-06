import { Directive, ElementRef, HostListener } from "@angular/core";
import { NgControl } from "@angular/forms";

@Directive({
    selector: 'input[nonSpecialChar], textarea[nonSpecialChar]'
})
export class NonSpecialCharDirective {
    inputElement: ElementRef;

    arabicRegex = '[\u0600-\u06FF]';

    constructor(private el: ElementRef, private control: NgControl) {
        this.inputElement = el;
    }

    @HostListener('keypress', ['$event']) onKeyPress(event) {
        this.noSpecialChars(event);
    }

    noSpecialChars(event) {
        const initalValue = this.el.nativeElement.value;
        const e = <KeyboardEvent>event;
        if (e.key === 'Tab' || e.key === 'TAB') { return; }

        if (initalValue.length > this.inputElement.nativeElement.maxLength) {
            return;
        }

        let k;
        k = event.keyCode;  // k = event.charCode;  (Both can be used)
        if ((k > 64 && k < 91) || (k > 96 && k < 123) || k === 8 || k === 32 || (k >= 48 && k <= 57)) {
            return;
        }
        const ch = String.fromCharCode(e.keyCode);
        const regEx = new RegExp(this.arabicRegex);
        if (regEx.test(ch)) { return; }

        this.inputElement.nativeElement.value = initalValue + ch.normalize('NFD').replace(/[^\w\s]/gi, '');
        this.control.control.setValue(this.inputElement.nativeElement.value);

        e.preventDefault();
        return;
    }

    @HostListener('paste', ['$event']) onPaste(event) {
        const initalValue = this.el.nativeElement.value;
        const e = <ClipboardEvent>event;

        if (initalValue.length >= this.inputElement.nativeElement.maxLength) {
            this.control.control.setValue(initalValue.substring(0, this.inputElement.nativeElement.maxLength));
            e.preventDefault();
            return;
        }

        let regex = /[a-zA-Z0-9\u0600-\u06FF]./g;

        const pasteData = e.clipboardData.getData('text/plain');
        let m;
        let matches = 0;

        while ((m = regex.exec(pasteData)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) { regex.lastIndex++; }
            // The result can be accessed through the `m`-variable.
            m.forEach((match, groupIndex) => { matches++; });
        }
        if (matches === pasteData.length) { return; }
        else {
            let remocaoEspecialChar = pasteData.normalize('NFD').replace(/[^\w\s]/gi, '');
            let value = this.control.control?.value ?? '';
            this.control.control.setValue(value + remocaoEspecialChar);

            e.preventDefault();
        }
    }
}