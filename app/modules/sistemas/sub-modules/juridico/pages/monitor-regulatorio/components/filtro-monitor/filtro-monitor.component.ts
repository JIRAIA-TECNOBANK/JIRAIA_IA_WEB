import { Component, EventEmitter, OnInit, Output, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { DadosOriginais } from '../../../../core/model/filtro-monitor.model';
import { TipoNormativo, responseApiTipoNormativo } from '../../../../core/model/normativos.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-filtro-monitor',
  templateUrl: './filtro-monitor.component.html',
  styleUrls: ['./filtro-monitor.component.scss'],
})
export class FiltroMonitorComponent implements OnInit {
  @Output() dadosFiltrados = new EventEmitter<any[]>();

  url: string = 'https://tst-regulatorio-api.tecnobank.com.br/api/filtros/tipo-normativo'
  filtroForm: FormGroup;
  listaTipoNormativo: TipoNormativo[] = []
  dadosOriginais: DadosOriginais[];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<FiltroMonitorComponent>,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.filtroForm = this.fb.group({ // Definição dos forms dos inputs
      nomePortaria: [''],
      tipoNormativo: [''],
      dataVigenciaInicio: [''],
      dataVigenciaFim: ['']
    });
  }

  ngOnInit(): void {
    this.dadosOriginais = this.data.dadosOriginais; // atribuindo os dados vindos do lista regulamentos
    
    this.pegarTipoNormativo().subscribe(response => {
      this.listaTipoNormativo = response.result.tiposNormativo; 
      this.filtrarTipoNormativo();
    });
  }

  pegarTipoNormativo(): Observable<responseApiTipoNormativo> {
    return this.http.get<responseApiTipoNormativo>(this.url)
  }

  filtrarTipoNormativo(): void {
    // Filtra os normativos com base no id dos elementos em dadosOriginais
    const idsOriginais = this.dadosOriginais.map(dado => dado.tipoNormativo);
    this.listaTipoNormativo
  }

  aplicarFiltros() {
    const filtros = this.filtroForm.value; // atribuindo o filtro dos inputs em uma variável

    const dadosFiltrados = this.dadosOriginais.filter(item => {
      // atribua na variavel os dados originais que forem semelhantes as dgitados no input
      const correspondeNomePortaria = filtros.nomePortaria // se essa propriedade existir
        ? item.nomePortaria.toLowerCase().includes(filtros.nomePortaria.toLowerCase()) 
        : true;
        
      // verifica se o tipo normativo no item corresponde ao selecionado no filtro
      const correspondetipoNormativo = filtros.tipoNormativo
        ? item.tipoNormativo === Number(filtros.tipoNormativo)
        : true;
        
      // atribua na variavel a data dos dados originais que forem maior ou igual aos do digitado no input
      const correspondeDataInicio = filtros.dataVigenciaInicio
        ? new Date(item.dataVigencia) >= new Date(filtros.dataVigenciaInicio)
        : true;

      // atribua na variavel a data dos dados originais que forem menor ou igual aos do digitado no input
      const correspondeDataFim = filtros.dataVigenciaFim
        ? new Date(item.dataVigencia) <= new Date(filtros.dataVigenciaFim)
        : true;

      return correspondeNomePortaria && correspondetipoNormativo && correspondeDataInicio && correspondeDataFim;
    });

    this.dadosFiltrados.emit(dadosFiltrados);
    this.dialogRef.close(dadosFiltrados);
  }

  limparFiltros() {
    this.filtroForm.reset();
    this.dadosFiltrados.emit(this.dadosOriginais);
    this.dialogRef.close(this.dadosOriginais);
  }
}
