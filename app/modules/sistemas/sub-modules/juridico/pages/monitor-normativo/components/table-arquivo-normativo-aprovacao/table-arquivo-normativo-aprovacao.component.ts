import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Utility } from 'src/app/core/common/utility';
import { HackatonService } from '../../../../services/hackaton.service';
import { ArquivoNormativo, StatusArquivoNormativo } from '../../../../core/model/arquivo-normativo.model';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { DialogCustomService } from 'src/app/shared/services/dialog-custom.service';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';
import { EnviarArquivoCompiladoDialogComponent } from '../enviar-arquivo-compilado-dialog/enviar-arquivo-compilado-dialog.component';
import { AprovarArquivoNormativoDialogComponent } from '../aprovar-arquivo-normativo-dialog/aprovar-arquivo-normativo-dialog.component';
import { NormativosService } from '../../../../services/normativos.service';
import { debug } from 'console';

@Component({
  selector: 'app-table-arquivo-normativo-aprovacao',
  templateUrl: './table-arquivo-normativo-aprovacao.component.html',
  styleUrls: ['./table-arquivo-normativo-aprovacao.component.scss']
})
export class TableArquivoNormativoAprovacaoComponent {
  utility = Utility;

  displayedColumns: string[] = [
    'NomePortaria',
    'Status',
    'EhVisaoEstadual',
    'TipoPortaria',
    'TipoRegistro',
    'Estado',
    'DataVigencia',
    'DtHrCriado',
    'DtHrModificado',
    'acoes'
  ];

  totalItens = 0;

  items$: Observable<ArquivoNormativo[]>;

  constructor(
    private hackatonService: HackatonService,
    private notifierService: NotifierService,
    private dialog: MatDialog,
    private dialogService: DialogCustomService,
    private normativoService: NormativosService) { }

  ngOnInit() {
    this.items$ = this.hackatonService.obterArquivosNormativosAprovacao();
  }

  aprovarNormativo(arquivoNormativo: ArquivoNormativo): void {
    const dialogRef = this.dialog.open(AprovarArquivoNormativoDialogComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'aprovar-normativo'),
      data: {
        title: 'Aprovar normativo',
        buttonCancel: {
          value: false,
          text: 'Fechar',
        },
        buttonConfirm: {
          value: true,
          text: 'Aprovar',
        },
        disableSaveWithoutData: true,
        normativo: {
          nomePortaria: arquivoNormativo.nomePortaria,
          visao: arquivoNormativo.ehVisaoEstadual,
          tipoNormativo: arquivoNormativo.tipoPortaria,
          tipoRegistro: arquivoNormativo.tipoRegistro,
          uf: arquivoNormativo.estado,
          dataVigencia: arquivoNormativo.dataVigencia
        }
      },
    });

    dialogRef.beforeClosed().subscribe((confirmacao) => {
      if (confirmacao) {
        this.hackatonService.obterArquivoNormativo(arquivoNormativo.id).subscribe({
          next: (retornoArquivo) => {
            let arquivo = this.utility.converterBase64ParaArquivo(
              retornoArquivo.lista[0].base64,
              retornoArquivo.lista[0].nome,
              'application/pdf'
            );

            this.hackatonService.obterResumoDeDocumento(arquivo).subscribe(() => {
              this.criarNormativo(confirmacao, arquivo);

              this.hackatonService.aprovarNormativo(arquivoNormativo.id).subscribe({
                next: () => {
                  this.notifierService.showNotification(
                    'Arquivo normativo aprovado com sucesso!',
                    'Arquivo aprovado',
                    'success'
                  );
                }
              });
            });
          }
        });
      }
    });
  }

  rejeitarNormativo(id: number): void {
    this.hackatonService.rejeitarNormativo(id).subscribe({
      next: () => {
        this.notifierService.showNotification('Arquivo normativo rejeitado com sucesso!', 'Arquivo rejeitado', 'success');
      }
    });
  }

  criarNormativo(request: any, arquivo: File) {
    this.normativoService.cadastrarNormativo(request, arquivo, arquivo.name).subscribe({
      next: () => {
        this.notifierService.showNotification("O normativo foi aprovado e incluido com sucesso.", "Normativo incluido com sucesso", "success");
      }
    });
  }

  baixarNormativo(id: number): void {
    this.hackatonService.obterArquivoNormativo(id).subscribe({
      next(retorno) {
        const linkSource = `data:application/octet-stream;base64,${retorno.lista[0].base64}`;
        const downloadLink = document.createElement('a');

        downloadLink.href = linkSource;
        downloadLink.download = retorno.lista[0].nome;

        downloadLink.click();

        downloadLink.remove();
      },
    })
  }
}
