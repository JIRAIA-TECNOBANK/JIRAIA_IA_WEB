import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
interface ButtonMenuList {
  id: number;
  buttonName: string;
  isRequired: boolean;
}

@Component({
  selector: 'app-stepper-buttons',
  templateUrl: './stepper-buttons.component.html',
  styleUrls: ['./stepper-buttons.component.scss'],
})
export class StepperButtonsComponent implements OnInit, OnChanges {
  @Input() buttons: ButtonMenuList[];
  @Input() emmiter: number = 1;
  @Output() stepAction: EventEmitter<ButtonMenuList> =
    new EventEmitter<ButtonMenuList>();

  formStep: number = 1;

  constructor() {
    //
  }

  ngOnInit(): void {
    //
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.formStep != changes.emmiter.currentValue) {
      this.formStep = changes.emmiter.currentValue;
      let button = this.buttons.filter(
        (result) => result.id === this.formStep
      )[0];
      this.stepAction.emit(button);
    }
  }

  checkIndex(stepId: number) {
    return this.formStep === stepId ? true : false;
  }

  onClick(button: ButtonMenuList) {
    this.formStep = button.id;
    this.stepAction.emit(button);
  }
}
