import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Normativo } from '../../../../core/model/normativos.model';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { NormativosService } from '../../../../services/normativos.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { FiltroMonitorComponent } from '../filtro-monitor/filtro-monitor.component';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';

@Component({
  selector: 'app-lista-regulamentos',
  templateUrl: './lista-regulamentos.component.html',
  styleUrls: ['./lista-regulamentos.component.scss'],
})
export class ListaRegulamentosComponent implements OnChanges {
  @Input() totalRegistrosEstadual: number = 0;
  @Input() totalRegistrosNacional: number = 0;
  @Input() skeletonGrid: boolean = false;
  @Input() regulamentos: Normativo[] = [];
  @Input() layoutAlternativo: boolean = false;
  @Input() opcaoSelecionada: number = 0;

  @Output() optionChangeEstadualEvent: EventEmitter<number> = new EventEmitter();
  @Output() optionChangeNacionalEvent: EventEmitter<number> = new EventEmitter();
  @Output() pageChangeEstadualEvent: EventEmitter<PageEvent> = new EventEmitter();
  @Output() pageChangeNacionalEvent: EventEmitter<PageEvent> = new EventEmitter();

  @ViewChild(MatPaginator) paginator: MatPaginator;

  utility = Utility;

  regulamentosFiltrados: Normativo[] = [];

  constructor(
    private normativoService: NormativosService,
    private cdr: ChangeDetectorRef,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    public dialog: MatDialog
  ) {
    this.matIconRegistry.addSvgIcon("icone-novo-verde",this.domSanitizer.bypassSecurityTrustResourceUrl("./assets/img/custom-icons/icone-new-verde.svg"))
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.regulamentos && changes.regulamentos.currentValue) { 
      this.regulamentosFiltrados = this.regulamentos;
    }
  }

  downloadNormativo(normativo: Normativo) {
    this.normativoService
      .downloadNormativo(normativo.id)
      .subscribe((result) => {
        const downloadLink = document.createElement('a');
        const url = window.URL.createObjectURL(result);
        downloadLink.href = url;
        downloadLink.download = normativo.nomeArquivo;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        window.URL.revokeObjectURL(url);
      });
  }

  public validarArquivoNovo(dataOriginal: string): boolean {
    const data = new Date(dataOriginal);
    const dataAtual = new Date();
    const diferencaTempo = dataAtual.getTime() - data.getTime();
    const diferencaDias = diferencaTempo / (1000 * 60 * 60 * 24);

    return diferencaDias < 5;
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(FiltroMonitorComponent, {
      id: Utility.getElementId(TipoElemento.dlg, 'filtrar-monitor'),
      width: '550px',
      data: { dadosOriginais: this.regulamentos }, // envia os dados originais para o filtro monitor (quando ele for aberto)
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.regulamentosFiltrados = result;  // Atualiza a lista filtrada
      }
    });
  }
}
