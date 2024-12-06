import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DialogCustomComponent } from '../dialog-custom/dialog-custom.component';
import { LiberacaoAcessoComponent } from 'src/app/modules/sistemas/sub-modules/crm/pages/operacional/espelho-contrato/components/liberacao-acesso/liberacao-acesso.component';
import { DialogCustomService } from '../../services/dialog-custom.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { LiberarAcessos } from 'src/app/modules/sistemas/core/models/common/liberar-acessos.model';
import { Utility } from 'src/app/core/common/utility';

@Component({
  selector: 'app-liberar-acessos',
  templateUrl: './liberar-acessos.component.html',
  styleUrls: ['./liberar-acessos.component.scss']
})
export class LiberarAcessosComponent implements OnInit {

  constructor(private dialogService: DialogCustomService, private dialog: MatDialog) { }

  @Output('liberacaoAcesso') liberacaoAcesso: EventEmitter<LiberarAcessos> = new EventEmitter<LiberarAcessos>();

  utility = Utility;
  liberado: boolean = false;

  ngOnInit(): void {
    // vazio
  }

  liberarInformacoes() {
    const dialogRef = this.dialog.open(DialogCustomComponent, {
      width: '500px',
      data: {
        component: LiberacaoAcessoComponent,
        buttonCancel: {
          value: false,
          text: 'Cancelar',
        },
        buttonConfirm: {
          value: true,
          text: 'Liberar',
        },
        disableSaveWithoutData: true
      },
    });

    dialogRef.afterClosed().subscribe(confirmacao => {
      if (confirmacao) {
        this.dialogService.dialogData$.subscribe(response => {
          if (response.dataType == 'liberacaoAcesso') {
            let output: LiberarAcessos = {
              solicitanteId: response.data.solicitanteId,
              solicitante: response.data.solicitante,
              solicitanteValor: response.data.descricao
            };

            this.liberacaoAcesso.emit(output);
            this.liberado = true;
          }
        });
      }
    })
  }

}
