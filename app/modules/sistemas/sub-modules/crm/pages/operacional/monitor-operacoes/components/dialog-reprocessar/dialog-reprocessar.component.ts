import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, FormGroup } from '@angular/forms';
import { Utility } from 'src/app/core/common/utility';

@Component({
  selector: 'app-dialog-reprocessar',
  templateUrl: './dialog-reprocessar.component.html',
  styleUrls: ['./dialog-reprocessar.component.scss']
})
export class DialogReprocessarComponent implements OnInit {

  utility = Utility;

  constructor(private formBuilder: UntypedFormBuilder) { }

  formReprocessar: FormGroup;

  ngOnInit(): void {
    this.formReprocessar = this.formBuilder.group({
      codigo: [{ value: '30 - Transação realizada com sucesso', disabled: true }],
    });
  }
}
