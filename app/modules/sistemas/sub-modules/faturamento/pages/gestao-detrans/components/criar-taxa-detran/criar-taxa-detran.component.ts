import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { PermissoesSistema } from 'src/app/core/common/permissoes-sistema';
import { Utility } from 'src/app/core/common/utility';
import { TransacaoFaturamento } from 'src/app/modules/sistemas/sub-modules/admin/core/models/_portal/transacoes/transacao-faturamento.model';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { TipoOperacao } from '../../../../../crm/core/enums/tipo-operacao.enum';
import { TaxaDetranOperacao } from '../../../../core/models/taxa/taxa-detran-operacao.model';
import { TaxaDetran } from '../../../../core/models/taxa/taxa-detran.model';
import { CriarTaxaDetranRequest } from '../../../../core/requests/taxa/criar-taxa-detran.request';
import { TaxaService } from '../../../../services/taxa.service';
import { DialogConfirmarTaxasComponent } from '../dialog-confirmar-taxas/dialog-confirmar-taxas.component';

@Component({
  selector: 'app-criar-taxa-detran',
  templateUrl: './criar-taxa-detran.component.html',
  styleUrls: ['./criar-taxa-detran.component.scss']
})
export class CriarTaxaDetranComponent {

  utility = Utility;

  @Input('uf') uf: string;
  @Input('taxaDetran') taxaDetran: TaxaDetran;
  @Input('transacoesElegiveis') transacoesElegiveis: TransacaoFaturamento[];
  @Output('fecharFormulario') fecharFormulario: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private fb: UntypedFormBuilder,
    private dialog: MatDialog,
    private taxaService: TaxaService,
    private notifierService: NotifierService) { }

  formulario = this.fb.group({
    id: [''],
    flag1: [{ value: 0, disabled: true }],
    flag2: [{ value: 0, disabled: true }],
    flag3: [{ value: 0, disabled: true }],
    flag4: [{ value: 0, disabled: true }],
    inicio: ['', Validators.compose([
      Validators.required,
      Utility.dynamicValidator(() => { return this.inicioMaiorQueMinimo(); }, 'dataMinima')
    ])],
    termino: ['', Validators.required]
  });

  flagsSelecionadas = new SelectionModel<string>(true, []);
  flagsHabilitadas: TipoOperacao[] = [];
  inicioMinimo: Date = new Date();
  erroDataInicial: boolean = false;
  erroDataFinal: boolean = false;

  ngOnInit() {
    this.inicioMinimo.setHours(0, 0, 0, 0);
    this.inicioMinimo.setDate(this.inicioMinimo.getDate() + 1);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.taxaDetran.currentValue) {
      if (this.taxaDetran.status === 'AGENDADO') {
        this.obterFlagsElegiveisPorEstado();
      }
      else {
        this.formulario?.get('inicio').disable();
      }

      this.carregarTaxaDetran(this.taxaDetran);
      return;
    }

    this.obterFlagsElegiveisPorEstado();
  }

  verificarValidadeFormulario() {
    return this.formulario?.valid && this.verificarFlagSelecionada() > 0;
  }

  onClickConfirmar() {
    const dialogRef = this.dialog.open(DialogCustomComponent, {
      width: '500px',
      data: {
        component: DialogConfirmarTaxasComponent,
        title: '',
        buttonCancel: {
          value: false,
          text: 'Cancelar',
        },
        buttonConfirm: {
          value: true,
          text: 'Confirmar'
        },
        disableSaveWithoutData: true
      },
    });

    dialogRef.beforeClosed().subscribe(confirmacao => {
      if (confirmacao) {
        this.confirmarTaxaDetran();
      }
    });
  }

  private confirmarTaxaDetran() {
    let criarTaxaDetranRequest: CriarTaxaDetranRequest = <CriarTaxaDetranRequest>{
      uf: this.uf,
      dataInicioVigencia: this.formulario.get('inicio').value,
      dataTerminoVigencia: this.formulario.get('termino').value,
      criadoPor: PermissoesSistema.retornarNomeUsuario,
      operacoes: [
        <TaxaDetranOperacao>{
          operacaoId: TipoOperacao.RegistrarContrato,
          ativo: this.selecionada('flag' + TipoOperacao.RegistrarContrato),
          valorTaxa: this.formulario.get('flag' + TipoOperacao.RegistrarContrato).value
        },
        <TaxaDetranOperacao>{
          operacaoId: TipoOperacao.AlterarContrato,
          ativo: this.selecionada('flag' + TipoOperacao.AlterarContrato),
          valorTaxa: this.formulario.get('flag' + TipoOperacao.AlterarContrato).value
        },
        <TaxaDetranOperacao>{
          operacaoId: TipoOperacao.RegistrarAditivo,
          ativo: this.selecionada('flag' + TipoOperacao.RegistrarAditivo),
          valorTaxa: this.formulario.get('flag' + TipoOperacao.RegistrarAditivo).value
        },
        <TaxaDetranOperacao>{
          operacaoId: TipoOperacao.AlterarAditivo,
          ativo: this.selecionada('flag' + TipoOperacao.AlterarAditivo),
          valorTaxa: this.formulario.get('flag' + TipoOperacao.AlterarAditivo).value
        }
      ]
    };

    if (this.taxaDetran) {
      this.editarTaxaDetran(criarTaxaDetranRequest);
      return;
    }

    this.criarTaxaDetran(criarTaxaDetranRequest);
  }

  private criarTaxaDetran(criarTaxaDetranRequest: CriarTaxaDetranRequest) {
    this.erroDataInicial = false;
    this.erroDataFinal = false;

    this.taxaService.criarTaxaDetran(criarTaxaDetranRequest).subscribe(response => {
      if (response.taxaDetranId) {
        this.notifierService.showNotification('Taxa DETRAN cadastrada com sucesso!', '', 'success');
        this.fecharFormulario.emit(true);
        return
      }

      this.notifierService.showNotification(response.errors[0].message, '', "error");

      if (response.errors.filter(e => e.propertyName === 'DataInicioVigencia').length > 0) {
        this.formulario.controls['inicio'].setErrors({ 'dataMinima': true });
        this.erroDataInicial = true;
      }

      if (response.errors.filter(e => e.propertyName === 'DataTerminoVigencia').length > 0) {
        this.formulario.controls['termino'].setErrors({ 'dataMinima': true });
        this.erroDataFinal = true;
      }
    });
  }

  private editarTaxaDetran(criarTaxaDetranRequest: CriarTaxaDetranRequest) {
    this.taxaService.editarTaxaDetran(this.taxaDetran.id, criarTaxaDetranRequest).subscribe(response => {
      if (response.operacoes) {
        if (this.taxaDetran.status === 'VIGENTE') { this.notifierService.showNotification('Taxa DETRAN vigente alterada com sucesso!', '', 'success'); }
        else { this.notifierService.showNotification('Taxa DETRAN agendada alterada com sucesso!', '', 'success'); }
        this.fecharFormulario.emit(true);
      }
    });
  }

  desabilitarFlag(flag: TipoOperacao) {
    return this.flagsHabilitadas.indexOf(flag) < 0;
  }

  retornarDataMinimaTermino() {
    return this.inicioMaiorQueMinimo() ? this.formulario?.get('inicio').value : this.inicioMinimo;
  }

  private inicioMaiorQueMinimo() {
    if (this.formulario?.get('inicio')?.value) {
      const date = new Date(this.formulario?.get('inicio').value);
      return date.getTime() >= this.inicioMinimo?.getTime();
    }

    return true;
  }

  private obterFlagsElegiveisPorEstado() {
    this.transacoesElegiveis.forEach(tf => {
      if (tf.ehFaturamento) {
        this.flagsHabilitadas.push(tf.operacaoId);
      }
    })
  }

  private carregarTaxaDetran(taxaDetran: TaxaDetran) {
    taxaDetran?.operacoes.forEach(o => {
      if (o.ativo) {
        this.check('flag' + o.operacaoId);
      }
    });

    this.formulario?.patchValue({
      id: taxaDetran.id,
      flag1: taxaDetran.operacoes.filter(o => o.operacaoId == TipoOperacao.RegistrarContrato)[0]?.valorTaxa || 0,
      flag2: taxaDetran.operacoes.filter(o => o.operacaoId == TipoOperacao.AlterarContrato)[0]?.valorTaxa || 0,
      flag3: taxaDetran.operacoes.filter(o => o.operacaoId == TipoOperacao.RegistrarAditivo)[0]?.valorTaxa || 0,
      flag4: taxaDetran.operacoes.filter(o => o.operacaoId == TipoOperacao.AlterarAditivo)[0]?.valorTaxa || 0,
      inicio: taxaDetran.dataInicioVigencia,
      termino: taxaDetran.dataTerminoVigencia,
    });

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

  private habilitarControl(control: string) {
    if (this.taxaDetran?.status === 'VIGENTE') { return; }
    this.formulario.get(control).reset();
    this.formulario.get(control).enable();
  }

  private desabilitarControl(control: string) {
    this.formulario.get(control).patchValue(0);
    this.formulario.get(control).disable();
  }

}
