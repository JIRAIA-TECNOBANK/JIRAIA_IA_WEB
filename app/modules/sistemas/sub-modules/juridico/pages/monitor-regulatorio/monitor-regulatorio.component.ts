import { Component, OnInit } from '@angular/core';
import { NotificacoesService } from '../../../crm/services/notificacoes.service';
import { ConexaoDetrans } from '../../../crm/core/models/conexao-detrans/conexao-detrans.model';
import { Utility } from 'src/app/core/common/utility';
import { UntypedFormBuilder } from '@angular/forms';
import { FiltroNormativos, Normativo } from '../../core/model/normativos.model';
import { catchError, of } from 'rxjs';
import { Registro } from '../../core/model/registro.model';
import { PageEvent } from '@angular/material/paginator';
import { NormativosService } from '../../services/normativos.service';
import { RegistrosService } from '../../services/registros.service';
import { GarantiasService } from '../../services/garantias.service';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { Store } from '@ngrx/store';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { InstituicaoFinanceiraService } from '../../services/instituicao-financeira.service';
import { Instituicao } from '../../core/model/instituicao-financeira.model';

enum AbaVisualizacao {
  PrimeiraAba,
  SegundaAba
}
@Component({
  selector: 'app-monitor-regulatorio',
  templateUrl: './monitor-regulatorio.component.html',
  styleUrls: ['./monitor-regulatorio.component.scss'],
})

export class MonitorRegulatorioComponent implements OnInit {
  observacaoPrimeiraAba: string = null
  // 'O envio de informações pela instituição financeira ilustrado na imagem acima, corresponde a: Envio 1: Apontamento do Gravame (Exigência prevista nos Arts. 5º a 7º da Resolução 807 do CONTRAN); Envio 2: Registro do Contrato (Exigência prevista nos Arts. 8º a 15 da Resolução 807 do CONTRAN); Envio 3: Registro de ativos financeiros (Exigência prevista nos Arts. 1º a 3º da Resolução 4088/12 do BACEN).';
  observacaoSegundaAba: string = null;
  observacaoTerceiraAba: string = null;

  utility = Utility;

  dadosRegistro: Registro;
  dadosGarantia: Registro;
  dadosInstituicao: Instituicao;

  subtituloDadosRegistro: string = 'A instituição financeira seleciona uma empresa credenciada que realiza o registro de contrato pelo Detran.'
  subtituloDadosGarantia: string = 'CONVÊNIO para envio da intenção do gravame (SNG) + anotação do gravame pelo DETRAN.'
  
  ufSelecionada: string = null;
  idUfSelecionada: string = null;
  carregandoSkeleton: boolean = true;
  limparFiltros: boolean = false;
  
  formulario = this.fb.group({
    aba: [0],
  });

  public AbaVisualizacao = AbaVisualizacao;

  public estados = [
    {uf: 'AM', descricao: 'Amazonas'},
    {uf: 'RR', descricao: 'Roraima'},
    {uf: 'AC', descricao: 'Acre'},
    {uf: 'AP', descricao: 'Amapá'},
    {uf: 'PA', descricao: 'Pará'},
    {uf: 'RO', descricao: 'Rondônia'},
    {uf: 'MT', descricao: 'Mato Grosso'},
    {uf: 'MS', descricao: 'Mato Grosso do Sul'},
    {uf: 'MA', descricao: 'Maranhão'},
    {uf: 'PI', descricao: 'Piauí'},
    {uf: 'CE', descricao: 'Ceará'},
    {uf: 'RN', descricao: 'Rio Grande do Norte'},
    {uf: 'PB', descricao: 'Paraíba'},
    {uf: 'PE', descricao: 'Pernambuco'},
    {uf: 'AL', descricao: 'Alagoas'},
    {uf: 'SE', descricao: 'Sergipe'},
    {uf: 'BA', descricao: 'Bahia'},
    {uf: 'TO', descricao: 'Tocantins'},
    {uf: 'GO', descricao: 'Goiás'},
    {uf: 'DF', descricao: 'Distrito Federal'},
    {uf: 'MG', descricao: 'Minas Gerais'},
    {uf: 'ES', descricao: 'Espírito Santo'},
    {uf: 'RJ', descricao: 'Rio de Janeiro'},
    {uf: 'SP', descricao: 'São Paulo'},
    {uf: 'PR', descricao: 'Paraná'},
    {uf: 'SC', descricao: 'Santa Catarina'},
    {uf: 'RS', descricao: 'Rio Grande do Sul'}
  ]

  listaNormativosNacional: Normativo[] = [];
  listaNormativosEstadual: Normativo[] = [];

  totalRegistrosNormativosNacional: number;
  totalRegistrosNormativosEstadual: number;

  opcaoVisaoEstadualSelecionada: number = 0;
  opcaoVisaoNacionalSelecionada: number = 0;

  constructor(
    private store: Store<{ preloader: IPreloaderState }>,
    private notificacoesService: NotificacoesService,
    private fb: UntypedFormBuilder,
    private normativoService: NormativosService,
    private registroService: RegistrosService,
    private garantiaService: GarantiasService,
    private instituicaoService: InstituicaoFinanceiraService
  ) {}

  ngOnInit(): void {
    this.carregarRegulamentos(this.ufSelecionada, 0, 5, '1', true);
    //this.carregandoSkeleton = false;
  }

  carregarRegulamentos(estado: string, pageIndex: number, pageSize: number, tipoRegistro: string = null, visaoNacional: boolean = null,) {
    //this.store.dispatch(showPreloader({ payload: 'Carregando...' }));
    this.carregandoSkeleton = true;

    let filtros = new FiltroNormativos();
    filtros.status = ['1']
    if(tipoRegistro)
      filtros.tipoRegistro ??= [tipoRegistro];

    if(estado)
      filtros.uf ??= [estado];

    filtros.visaoNacional ??= visaoNacional;

    this.normativoService
      .obterListaNormativo(pageIndex, pageSize, filtros)
      .pipe(
        catchError((error) => {
          this.carregandoSkeleton = false;
          //this.store.dispatch(closePreloader());
          if (error.status === 404) {
            return of(null);
          } else {
            console.error('An error occurred:', error);
            return of(null);
          }
        })
      )
      .subscribe((result: any) => {
        if (visaoNacional == true) {
          this.listaNormativosNacional = result.result.normativos;
          this.totalRegistrosNormativosNacional = result.result.totalItems;
        } else {
          this.listaNormativosEstadual = result.result.normativos;
          this.totalRegistrosNormativosEstadual = result.result.totalItems;
        }
        this.carregandoSkeleton = false;
        //this.store.dispatch(closePreloader());
      });
  }

  carregarRegistros(estado: string) {
    this.dadosRegistro = null;

    this.registroService.obterDadosRegistro(estado)
      .pipe(
        catchError((error) => {
          if (error.status === 404) {
            this.dadosRegistro = null;
            this.observacaoSegundaAba = null;
            return of(null);
          } else {
            console.error('An error occurred:', error);
            return of(null);
          }
        })
      )
      .subscribe((result: any) => {
        if (result) {
          this.dadosRegistro = result.dadosRegistro.result;
          this.observacaoSegundaAba = this.dadosRegistro?.observacao;
        }
      });
  }

  carregarGarantias(estado: string) {
    this.dadosGarantia = null;

    this.garantiaService.obterDadosGarantia(estado)
      .pipe(
        catchError((error) => {
          if (error.status === 404) {
            this.dadosGarantia = null;
            this.observacaoTerceiraAba = null;
            return of(null);
          } else {
            console.error('An error occurred:', error);
            return of(null);
          }
        })
      )
      .subscribe((result: any) => {
        if (result) {
          this.dadosGarantia = result.dadosGarantia.result;
          this.observacaoTerceiraAba = this.dadosGarantia?.observacao;
        }
      });
  }

  carregarInstituicaoFinanceira(estado: string) {
    this.dadosInstituicao = null;
  
    this.instituicaoService.obterDadosInstituicaoFinanceira(estado)
      .pipe(
        catchError((error) => {
          if (error.status === 404) {
            this.dadosInstituicao = null;
            this.observacaoTerceiraAba = null;
            return of(null);
          } else {
            console.error('An error occurred:', error);
            return of(null);
          }
        })
      )
      .subscribe((result: any) => {
        if (result) {
          this.dadosInstituicao = result.InstituicaoFinanceira.result;
          this.observacaoTerceiraAba = this.dadosInstituicao?.observacoes;
        }
      });
  }

  async selecionarEstado(estado: string) {
    if (estado === this.ufSelecionada) {
      this.formulario.get('aba').setValue(0);
      this.ufSelecionada = null;
      this.idUfSelecionada = null;
      this.limparFiltros = false;
      switch (this.opcaoVisaoNacionalSelecionada) {
        case 0:
          this.carregarRegulamentos(null, 0, 5, '1', true);
          break;
        case 1:
          this.carregarRegulamentos(null, 0, 5, '2', true);
          break;
        case 2:
          this.carregarRegulamentos(null, 0, 5, '3', true);
          break;
      }
    } else {
      //const retornoEstado = await lastValueFrom(this.juridicoService.obterListaUf(estado));
      //this.idUfSelecionada = retornoEstado.ufs[0].id.toString();
      this.formulario.get('aba').setValue(1);
      this.ufSelecionada = estado;
      this.opcaoVisaoNacionalSelecionada = 0;

      switch (this.opcaoVisaoEstadualSelecionada) {
        case 0:
          this.carregarRegulamentos(this.ufSelecionada, 0, 5, '1', false);
          this.carregarRegistros(this.ufSelecionada);
          break;
        case 1:
          this.carregarRegulamentos(this.ufSelecionada, 0, 5, '2', false);
          this.carregarGarantias(this.ufSelecionada);
          break;
        case 2:
          this.carregarRegulamentos(this.ufSelecionada, 0, 5, '3', false);
          this.carregarInstituicaoFinanceira(this.ufSelecionada); 
          break;
      }
    }
  }

  onPageRegulamentosNacionaisChange(pageEvent: PageEvent) {
    let tipoRegistro: string;
    switch (this.opcaoVisaoNacionalSelecionada) {
      case 0:
        tipoRegistro = '1';
        break;
      case 1:
        tipoRegistro = '2';
        break;
      case 2:
        tipoRegistro = '3';
        break;
    }
    this.carregarRegulamentos(null, pageEvent.pageIndex, pageEvent.pageSize, tipoRegistro, true);
  }

  onVisaoEstadualChange(pageEvent: PageEvent) {
    let tipoRegistro: string;
    switch (this.opcaoVisaoEstadualSelecionada) {
      case 0:
        tipoRegistro = '1';
        break;
      case 1:
        tipoRegistro = '2';
        break;
      case 2:
        tipoRegistro = '3';
        break;
    }
    this.carregarRegulamentos(this.ufSelecionada, pageEvent.pageIndex, pageEvent.pageSize, tipoRegistro, false);
  }

  changeLimparEstado() {
    this.limparFiltros = true;
    this.opcaoVisaoNacionalSelecionada = 0;
  }

  onVisaoEstadualOptionChange(select: number) {
    this.opcaoVisaoEstadualSelecionada = select;
    switch (select) {
      case 0:
        this.carregarRegulamentos(this.ufSelecionada, 0, 5, '1', false);
        this.carregarRegistros(this.ufSelecionada);
        break;
      case 1:
        this.carregarRegulamentos(this.ufSelecionada, 0, 5, '2', false);
        this.carregarGarantias(this.ufSelecionada);
        break;
      case 2:
        this.carregarRegulamentos(this.ufSelecionada, 0, 5, '3', false);
        this.carregarInstituicaoFinanceira(this.ufSelecionada); 
        break;
    }
  }

  onVisaoNacionalOptionChange(select: number) {
    this.opcaoVisaoNacionalSelecionada = select;
    switch (select) {
      case 0:
        this.carregarRegulamentos(null, 0, 5, '1', true);
        break;
      case 1:
        this.carregarRegulamentos(null, 0, 5, '2', true);
        break;
      case 2:
        this.carregarRegulamentos(null, 0, 5, '3', true);
        break;
    }
  }

  public formatEstado(uf: string){
    let estado: any = this.estados.filter(estado => estado.uf === uf);
    return estado[0].descricao;
  }
}
