import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Utility } from 'src/app/core/common/utility';
import { BlocoVazio } from 'src/app/modules/sistemas/core/models/common/bloco-vazio.model';
import { DominioService } from 'src/app/modules/sistemas/sub-modules/crm/services/dominio.service';
import { SortByPipe } from 'src/app/shared/pipes/sort-by.pipe';
import { InstituicaoFinanceiraService } from '../../../../services/instituicao-financeira.service';

@Component({
  selector: 'app-documentos-credenciamento',
  templateUrl: './documentos-credenciamento.html',
  styleUrls: ['./documentos-credenciamento.scss']
})
export class DocumentosCredenciamentoComponent {

  @Input('UF') UF: string;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  @Output('mostrarDetalhes') expandido: EventEmitter<boolean> = new EventEmitter<boolean>();

  utility = Utility;

  mostrarDetalhes: boolean = false;
  listaDocumentos: any[] = [];
  sucesso: boolean = true;
  loading: boolean = false;

  sortPipe = new SortByPipe();

  blocoVazio: BlocoVazio = {
    id: 'documentos-credenciamento',
    titulo:'Documentos para credenciamento',
    icone: './../../../../assets/img/custom-icons/icone-vazio-top-empresas.svg',
    subtitulo: ``,
    mensagem: ``,
  };

  constructor(private instituicaoService: InstituicaoFinanceiraService) { }

  ngOnInit() {
    this.carregarDocumentosUf();
  }

  ngOnChanges() {
    this.mostrarDetalhes = false;
    this.expandido.emit(this.mostrarDetalhes);
  }

  expandirDetalhes() {
    this.mostrarDetalhes = !this.mostrarDetalhes;

    if (this.mostrarDetalhes) {
      this.listaDocumentos = [];

      this.carregarDocumentosUf();
    }

    this.expandido.emit(this.mostrarDetalhes);
  }
  carregarDocumentosUf() {
    this.loading = true;
    this.sucesso = true;
    this.listaDocumentos = [];
  
    this.instituicaoService.obterDadosInstituicaoFinanceira(this.UF).subscribe(response => {
      const instituicaoFinanceira = response.InstituicaoFinanceira;
  
      if (Array.isArray(instituicaoFinanceira)) {
        this.listaDocumentos =instituicaoFinanceira[0].result?.documentos;
      } else {
        this.listaDocumentos = instituicaoFinanceira.result?.documentos || [];
      }
  
      this.loading = false;
    }, error => {
      this.loading = false;
    });
  }


  stopPropagation(event) {
    event.stopPropagation();
  }
}
