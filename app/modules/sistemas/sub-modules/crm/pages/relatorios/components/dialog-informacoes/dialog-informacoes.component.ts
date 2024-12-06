import { Component, OnInit } from '@angular/core';
// import { DialogCustomService } from 'src/app/modules/produtos/sub-modules/e-contrato/services/dialog-custom.service';

@Component({
  selector: 'app-dialog-informacoes',
  templateUrl: './dialog-informacoes.component.html',
  styleUrls: ['./dialog-informacoes.component.scss']
})
export class DialogInformacoesComponent implements OnInit {

  constructor(
    // private dialogService: DialogCustomService
    ) { }

  ngOnInit(): void {
    // this.dialogService.setDialogData('nodata');
  }

}
