import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input[type=number], input[numbers-only]'
})
export class NumbersOnlyDirective {

  constructor(private elRef: ElementRef, private control: NgControl) { }

  @HostListener('input', ['$event']) onInputChange(event) {
    const initalValue = this.elRef.nativeElement.value;
    this.elRef.nativeElement.value = initalValue.replace(/[^0-9]*/g, '');
    this.control.control.setValue(this.elRef.nativeElement.value);
    
    if (initalValue !== this.elRef.nativeElement.value) {
      event.stopPropagation();
    }
  }
}
