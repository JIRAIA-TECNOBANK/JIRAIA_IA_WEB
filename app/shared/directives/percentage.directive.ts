import { Directive, ElementRef, HostListener, Input, SimpleChange } from "@angular/core";
import { NgControl } from "@angular/forms";

@Directive({
  selector: 'input[percentage]'
})
export class PercentageDirective {

  constructor(private elRef: ElementRef, private control: NgControl) { }

  private init: boolean = true;

  @Input('percentage') decimal: number = 2;

  @HostListener('ngModelChange', ['$event']) onChange(event) {
    if (this.init) {
      if (typeof (event) == "string" && event != "") { this.elRef.nativeElement.value = event + "%"; }
      this.init = false;
    }
  }

  @HostListener('input', ['$event']) onInputChange(event) {
    if (event.inputType == 'deleteContentBackward') {
      this.elRef.nativeElement.value = this.elRef.nativeElement.value.slice(0, this.elRef.nativeElement.value.length - 1)
    }

    const initialValue = this.elRef.nativeElement.value != "" ? this.elRef.nativeElement.value.replace(/,/g, '.') : this.elRef.nativeElement.value;
    this.elRef.nativeElement.value = initialValue.replace(/[^0-9.]*/g, '');

    let numericValue = this.elRef.nativeElement.value;
    let firstValue = numericValue.split('.')[0];
    let secondValue = numericValue.split('.')[1] != undefined ? numericValue.split('.')[1].slice(0, this.decimal) : undefined;

    if (firstValue > 100) {
      let slicePosition = firstValue.slice(0, 3) > 100 ? 2 : 3;
      firstValue = firstValue.slice(0, slicePosition);
      numericValue = firstValue + ((slicePosition == 3 || secondValue == undefined) ? "" : ("." + secondValue));
    }
    else if (secondValue != undefined && numericValue.split('.')[1].length > secondValue.length) {
      numericValue = firstValue + "." + secondValue;
    }

    this.elRef.nativeElement.value = initialValue != "" ? numericValue + "%" : null;
    this.control.control.setValue(this.elRef.nativeElement.value);

    if (initialValue !== this.elRef.nativeElement.value) { event.stopPropagation(); }
  }
}