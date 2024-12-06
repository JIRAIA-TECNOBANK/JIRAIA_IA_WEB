import { Component, Inject, OnInit } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { DialogSimple } from './dialog-simple.model';

@Component({
  selector: 'app-dialog-simple',
  templateUrl: './dialog-simple.component.html',
  styleUrls: ['./dialog-simple.component.scss']
})
export class DialogSimpleComponent implements OnInit {
  title: string;
  message: string;
  iconType: string;
  textButton: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { settings: DialogSimple }) { }

  ngOnInit(): void {
    this.title = this.data.settings.title;
    this.message = this.data.settings.message;
    this.textButton = this.data.settings.textButton;
    this.iconType = this.data.settings.iconType;
  }

}
