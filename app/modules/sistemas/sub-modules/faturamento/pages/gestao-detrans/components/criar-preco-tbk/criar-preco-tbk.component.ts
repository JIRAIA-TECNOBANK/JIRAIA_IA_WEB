import { SelectionModel } from '@angular/cdk/collections';
import { registerLocaleData } from '@angular/common';
import ptBr from '@angular/common/locales/pt';
import { Component, EventEmitter, Input, LOCALE_ID, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { PermissoesSistema } from 'src/app/core/common/permissoes-sistema';
import { Utility } from 'src/app/core/common/utility';
import { ErrorMessage } from 'src/app/core/responses/error-message';
import { TransacaoFaturamento } from 'src/app/modules/sistemas/sub-modules/admin/core/models/_portal/transacoes/transacao-faturamento.model';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { TipoOperacao } from '../../../../../crm/core/enums/tipo-operacao.enum';
import { PrecoTbk } from '../../../../core/models/preco/preco-tbk.model';
import { TaxaDetranOperacao } from '../../../../core/models/taxa/taxa-detran-operacao.model';
import { TaxaDetran } from '../../../../core/models/taxa/taxa-detran.model';
import { CriarPrecoTbkRequest } from '../../../../core/requests/preco/criar-preco-tbk.request';
import { PrecoService } from '../../../../services/preco.service';
import { DialogConfirmarTaxasComponent } from '../dialog-confirmar-taxas/dialog-confirmar-taxas.component';

registerLocaleData(ptBr);

@Component({
  selector: 'app-criar-preco-tbk',
  templateUrl: './criar-preco-tbk.component.html',
  styleUrls: ['./criar-preco-tbk.component.scss'],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt' },
  ]
})
export class CriarPrecoTbkComponent {

  utility = Utility;

  @Input('uf') uf: string;
  @Input('precoTbk') precoTbk: PrecoTbk;
  @Input('taxaDetran') taxaDetran: TaxaDetran;
  @Input('primeiroPreco') primeiroPreco: boolean = false;
  @Input('transacoesElegiveis') transacoesElegiveis: TransacaoFaturamento[];
  @Output('fecharFormulario') fecharFormulario: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private fb: UntypedFormBuilder,
    private dialog: MatDialog,
    private precoService: PrecoService,
    private notifierService: NotifierService,
    private activatedRoute: ActivatedRoute,
    private store: Store<{ preloader: IPreloaderState }>) {

    this.detranId = +this.activatedRoute.snapshot.params['detranId'];
  }

  formulario = this.fb.group({
    id: [''],
    nome: [null],
    taxaFlag1: [{ value: 0, disabled: true }],
    taxaFlag2: [{ value: 0, disabled: true }],
    taxaFlag3: [{ value: 0, disabled: true }],
    taxaFlag4: [{ value: 0, disabled: true }],
    flag1: [{ value: 0, disabled: true }],
    flag2: [{ value: 0, disabled: true }],
    flag3: [{ value: 0, disabled: true }],
    flag4: [{ value: 0, disabled: true }],
    tipoPreco: [{ value: 1 }],
    inicio: ['', Validators.compose([
      Validators.required,
      Utility.dynamicValidator(() => { return this.inicioMaiorQueMinimo(); }, 'dataMinima')
    ])],
    termino: ['', Validators.required]
  });

  flagsSelecionadas = new SelectionModel<string>(true, []);
  flagsHabilitadas: TipoOperacao[] = [];
  inicioMinimo: Date = new Date();
  precoPublico: boolean = true;
  erroDataInicial: boolean = false;
  erroDataFinal: boolean = false;
  detranId: number = null;

  ngOnInit() {
    this.inicioMinimo.setHours(0, 0, 0, 0);
    this.inicioMinimo.setDate(this.inicioMinimo.getDate() + 1);
    this.inicializarFormulario();

    this.formulario.get('tipoPreco').valueChanges.subscribe(value => {
      this.limparPrecos();
      this.precoPublico = value === 1;
      this.formulario.get('nome').reset();

      if (value === 2) {
        Utility.changeFieldValidators(this.formulario, 'nome', [Validators.required]);
        Utility.changeFieldValidators(this.formulario, 'inicio', [Validators.nullValidator]);
        Utility.changeFieldValidators(this.formulario, 'termino', [Validators.nullValidator]);
        return;
      }

      Utility.changeFieldValidators(this.formulario, 'nome', [Validators.nullValidator]);
      Utility.changeFieldValidators(this.formulario, 'inicio', [
        Validators.required,
        Utility.dynamicValidator(() => { return this.inicioMaiorQueMinimo(); }, 'dataMinima')
      ]);
      Utility.changeFieldValidators(this.formulario, 'termino', [Validators.required]);
    });

    this.formulario.get('nome').valueChanges.subscribe(() => { this.removerErros('nome'); });
    this.formulario.get('flag1').valueChanges.subscribe(() => { this.removerErros('flag1'); });
    this.formulario.get('flag2').valueChanges.subscribe(() => { this.removerErros('flag2'); });
    this.formulario.get('flag3').valueChanges.subscribe(() => { this.removerErros('flag3'); });
    this.formulario.get('flag4').valueChanges.subscribe(() => { this.removerErros('flag4'); });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.precoTbk.currentValue) {
      this.precoPublico = this.precoTbk.tipoPreco == 1;

      if (this.precoPublico && this.precoTbk.status === 'VIGENTE') {
        this.formulario?.get('inicio').disable();
        this.formulario?.get('tipoPreco').disable();
        this.formulario?.get('nome').disable();
      }

      this.carregarPeriodoVigente();
      this.carregarPrecoTbk(this.precoTbk);
      return;
    }

    this.obterFlagsElegiveisPorEstado();
  }

  verificarValidadeFormulario() {
    if (this.verificarFlagSelecionada() == 0) return false;

    return this.formulario?.valid;
  }

  onClickConfirmar() {
    if (this.precoPublico) {
      this.abrirModalConfirmacaoPrecoPublico();
      return;
    }

    this.confirmarPrecoTbk();
  }

  private abrirModalConfirmacaoPrecoPublico() {
    const dialogRef = this.dialog.open(DialogCustomComponent, {
      width: '500px',
      data: {
        component: DialogConfirmarTaxasComponent,
        title: '',
        statusAtual: this.precoPublico ? 'Agendado' : 'Pré-agendado',
        buttonCancel: {
          value: false,
          text: 'Cancelar',
        },
        buttonConfirm: {
          value: true,
          text: 'Confirmar'
        },
      },
    });

    dialogRef.beforeClosed().subscribe(confirmacao => {
      if (confirmacao) {
        this.confirmarPrecoTbk();
      }
    });
  }

  private removerErros(control: string) {
    if (control !== 'nome') {
      this.tratarErrosControl('nome');
    }
    this.flagsHabilitadas.forEach(f => {
      if (this.formulario.get('flag' + f).hasError('ValorNomeDuplicado')) {
        this.tratarErrosControl('flag' + f);
      }
    });
  }

  private tratarErrosControl(control: string) {
    if (this.formulario.get(control).errors?.required) {
      this.formulario.get(control).setErrors(null);
      this.formulario.get(control).setErrors({ required: true });
    }
    else {
      this.formulario.get(control).setErrors(null);
    }
  }

  private carregarPeriodoVigente() {
    if (this.precoPublico) {
      if (this.primeiroPreco) {
        if (this.verificarDataMinima(this.taxaDetran?.dataInicioVigencia)) {
          this.formulario?.get('inicio').patchValue(this.taxaDetran.dataInicioVigencia);
        }

        if (this.verificarDataMinima(this.taxaDetran?.dataTerminoVigencia)) {
          this.formulario?.get('termino').patchValue(this.taxaDetran.dataTerminoVigencia);
        }
      }
    }
  }

  private verificarDataMinima(data: any) {
    if (data === null) return true;

    const date = new Date(data);
    return date.getTime() >= this.inicioMinimo?.getTime();
  }

  private confirmarPrecoTbk() {
    this.store.dispatch(showPreloader({ payload: '' }))

    let criarPrecoTbkRequest: CriarPrecoTbkRequest = <CriarPrecoTbkRequest>{
      uf: this.uf,
      dataInicioVigencia: this.formulario.get('inicio').value ?? new Date(),
      dataTerminoVigencia: this.formulario.get('termino').value,
      nome: this.formulario.get('nome').value,
      tipoPreco: this.formulario.get('tipoPreco').value,
      criadoPor: PermissoesSistema.retornarNomeUsuario,
      idMapaDetran: this.detranId,
      operacoes: [
        <TaxaDetranOperacao>{
          operacaoId: TipoOperacao.RegistrarContrato,
          ativo: this.selecionada('flag' + TipoOperacao.RegistrarContrato),
          valorTaxa: this.formulario.get('flag' + TipoOperacao.RegistrarContrato).value || 0
        },
        <TaxaDetranOperacao>{
          operacaoId: TipoOperacao.AlterarContrato,
          ativo: this.selecionada('flag' + TipoOperacao.AlterarContrato),
          valorTaxa: this.formulario.get('flag' + TipoOperacao.AlterarContrato).value || 0
        },
        <TaxaDetranOperacao>{
          operacaoId: TipoOperacao.RegistrarAditivo,
          ativo: this.selecionada('flag' + TipoOperacao.RegistrarAditivo),
          valorTaxa: this.formulario.get('flag' + TipoOperacao.RegistrarAditivo).value || 0
        },
        <TaxaDetranOperacao>{
          operacaoId: TipoOperacao.AlterarAditivo,
          ativo: this.selecionada('flag' + TipoOperacao.AlterarAditivo),
          valorTaxa: this.formulario.get('flag' + TipoOperacao.AlterarAditivo).value || 0
        }
      ]
    };

    if (this.precoTbk) {
      this.editarPrecoTbk(criarPrecoTbkRequest);
      return;
    }

    this.criarPrecoTbk(criarPrecoTbkRequest);
  }

  private criarPrecoTbk(criarPrecoTbkRequest: CriarPrecoTbkRequest) {
    this.erroDataInicial = false;
    this.erroDataFinal = false;

    this.precoService.criarPrecoTbk(criarPrecoTbkRequest).subscribe({
      next: (response) => {
        this.store.dispatch(closePreloader());
        
        if (response.precoTecnobankId) {
          let tipoPreco = this.formulario?.get('tipoPreco').value === 1 ? 'público' : 'privado';
          this.notifierService.showNotification(`Preço TBK ${tipoPreco} cadastrado com sucesso!`, '', 'success');
          
          this.fecharFormulario.emit(true);
          return
        }
        
        this.erroConfirmar(response.errors);
      },
      error: (response) => {
        this.store.dispatch(closePreloader());
        this.erroConfirmar(response.error.errors);
      }
    });
  }

  private editarPrecoTbk(criarPrecoTbkRequest: CriarPrecoTbkRequest) {
    this.precoService.editarPrecoTbk(this.precoTbk.id, criarPrecoTbkRequest).subscribe(response => {
      this.store.dispatch(closePreloader());

      if (response.id) {
        if (this.formulario?.get('tipoPreco').value === 1) {
          let tipoPreco = this.formulario?.get('tipoPreco').value === 1 ? 'público' : 'privado';
          let status = this.precoTbk.status === 'PREAGENDADO' ? 'pré-agendado' : this.precoTbk.status.toLowerCase();
          this.notifierService.showNotification(`Preço TBK ${tipoPreco} ${status} alterado com sucesso!`, '', 'success');
        }
        else { this.notifierService.showNotification(`Cesta alterada com sucesso!`, '', 'success'); }

        this.fecharFormulario.emit(true);
        return;
      }

      this.erroConfirmar(response.errors);
    });
  }

  desabilitarFlag(flag: TipoOperacao) {
    return this.flagsHabilitadas.indexOf(flag) < 0;
  }

  retornarDataMinimaTermino() {
    if (this.precoTbk?.status === 'VIGENTE') {
      return new Date;
    }

    return this.inicioMaiorQueMinimo() ? this.formulario?.get('inicio').value : this.inicioMinimo;
  }

  private erroConfirmar(errors: ErrorMessage[]) {
    let mensagem = errors[0].message;
    let i = 1;

    while (i < errors.length) {
      mensagem += '<br><br>' + errors[i].message;
      i++;
    }

    this.notifierService.showNotification(mensagem, '', "error");

    if (errors.filter(e => e.propertyName.includes('DataInicioVigencia')).length > 0) {
      this.formulario.controls['inicio'].setErrors({ 'dataMinima': true });
      this.erroDataInicial = true;
    }

    if (errors.filter(e => e.propertyName.includes('DataTerminoVigencia')).length > 0) {
      this.formulario.controls['termino'].setErrors({ 'dataMinima': true });
      this.erroDataFinal = true;
    }

    if (errors.filter(e => e.propertyName.includes('ValoresOperacoes')).length > 0) {

      if (this.precoTbk) { this.validacaoOperacoesCesta(this.precoTbk.operacoes.map(o => o.operacaoId)); }
      else { this.validacaoOperacoesCesta(this.flagsHabilitadas); }

      this.formulario.get('nome').setErrors({ 'ValorNomeDuplicado': true });
    }
  }

  private validacaoOperacoesCesta(listaOperacoes: TipoOperacao[]) {
    listaOperacoes.forEach(f => {
      this.formulario.get('flag' + f).setErrors({ 'ValorNomeDuplicado': true });
    });
  }

  private inicializarFormulario() {
    if (!this.precoTbk) { this.formulario.get('tipoPreco').patchValue(1); }
    this.carregarTaxaDetran();
  }

  private carregarTaxaDetran() {
    if (this.taxaDetran?.operacoes) {
      this.carregarTaxaDetranFormulario(this.taxaDetran.operacoes);
    }
  }

  private carregarTaxaDetranFormulario(operacoes: TaxaDetranOperacao[]) {
    this.formulario.get('taxaFlag1').patchValue(operacoes.filter(t => t.operacaoId === TipoOperacao.RegistrarContrato)[0]?.valorTaxa || 0);
    this.formulario.get('taxaFlag2').patchValue(operacoes.filter(t => t.operacaoId === TipoOperacao.AlterarContrato)[0]?.valorTaxa || 0);
    this.formulario.get('taxaFlag3').patchValue(operacoes.filter(t => t.operacaoId === TipoOperacao.RegistrarAditivo)[0]?.valorTaxa || 0);
    this.formulario.get('taxaFlag4').patchValue(operacoes.filter(t => t.operacaoId === TipoOperacao.AlterarAditivo)[0]?.valorTaxa || 0);
  }

  private limparPrecos() {
    this.formulario.get('flag1').reset();
    this.formulario.get('flag2').reset();
    this.formulario.get('flag3').reset();
    this.formulario.get('flag4').reset();
  }

  private inicioMaiorQueMinimo() {
    if (this.formulario?.get('inicio')?.value) {
      return this.verificarDataMinima(this.formulario?.get('inicio')?.value);
    }

    return true;
  }

  private carregarPrecoTbk(precoTbk: PrecoTbk) {
    precoTbk?.operacoes.forEach(o => {
      if (o.ativo) {
        this.check('flag' + o.operacaoId);
      }
    });

    this.formulario?.patchValue({
      id: precoTbk.id,
      nome: precoTbk.nome,
      flag1: precoTbk.operacoes.filter(o => o.operacaoId == TipoOperacao.RegistrarContrato)[0]?.valorTaxa || 0,
      flag2: precoTbk.operacoes.filter(o => o.operacaoId == TipoOperacao.AlterarContrato)[0]?.valorTaxa || 0,
      flag3: precoTbk.operacoes.filter(o => o.operacaoId == TipoOperacao.RegistrarAditivo)[0]?.valorTaxa || 0,
      flag4: precoTbk.operacoes.filter(o => o.operacaoId == TipoOperacao.AlterarAditivo)[0]?.valorTaxa || 0,
      inicio: precoTbk.dataInicioVigencia,
      termino: precoTbk.dataTerminoVigencia,
      tipoPreco: precoTbk.tipoPreco
    });

    if (!this.precoPublico) {
      this.formulario.get('inicio').reset();
      this.formulario.get('termino').reset();

      Utility.changeFieldValidators(this.formulario, 'termino', [Validators.nullValidator]);
      Utility.changeFieldValidators(this.formulario, 'inicio', [Validators.nullValidator]);
    }
  }

  edicaoPrecoPrivadoAprovado() {
    return !this.precoPublico && this.precoTbk && this.precoTbk.status != 'PREAGENDADO';
  }

  selecionarTodasFlags(event) {
    if (event.checked) {
      this.flagsHabilitadas.forEach(f => {
        this.flagsSelecionadas.select('flag' + f);
        this.habilitarControl('flag' + f);
      })
    } else {
      this.flagsHabilitadas.forEach(f => {
        this.flagsSelecionadas.deselect('flag' + f);
        this.desabilitarControl('flag' + f);
      })
    }
  }

  verificarFlagSelecionada() {
    if (this.flagsSelecionadas.selected.length === 0) return 0;
    if (this.flagsSelecionadas.selected.length === this.flagsHabilitadas.length) return 1;
    return 2;
  }

  check(control: string) {
    if (this.flagsSelecionadas.selected.length > 0) {
      if (this.flagsSelecionadas.selected.filter(c => c === control).length > 0) {
        this.flagsSelecionadas.deselect(this.flagsSelecionadas.selected.filter(c => c === control)[0]);
        this.desabilitarControl(control);
        return;
      }
    }

    this.flagsSelecionadas.select(control);

    this.habilitarControl(control);
  }

  selecionada(flag: string) {
    if (this.flagsSelecionadas.selected.length > 0) {
      return (this.flagsSelecionadas.selected.filter(f => f === flag).length > 0);
    }

    return this.flagsSelecionadas.isSelected(flag);
  }

  retornarValorTotal(flag: number) {
    let taxaDetran = +this.formulario.get('taxaFlag' + flag).value || 0;
    let precoTbk = +this.formulario.get('flag' + flag).value || 0;
    return taxaDetran + precoTbk;
  }

  private habilitarControl(control: string) {
    if (this.precoPublico) {
      if (this.precoTbk?.status === 'VIGENTE') { return; }
      this.formulario.get(control).reset();
    }

    this.formulario.get(control).enable();
  }

  private desabilitarControl(control: string) {
    this.formulario.get(control).patchValue(0);
    this.formulario.get(control).disable();
  }

  private obterFlagsElegiveisPorEstado() {
    this.transacoesElegiveis.forEach(tf => {
      if (tf.ehFaturamento) {
        this.flagsHabilitadas.push(tf.operacaoId);
      }
    })
  }
}
