import { Component, OnInit, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-dialog-usuario-existente',
  templateUrl: './dialog-usuario-existente.component.html',
  styleUrls: ['./dialog-usuario-existente.component.scss']
})
export class DialogUsuarioExistenteComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data) {
    this.innerHtml = this.data.mensagemModal;
  }

  innerHtml: string;

  ngOnInit(): void {
    //
  }

}
