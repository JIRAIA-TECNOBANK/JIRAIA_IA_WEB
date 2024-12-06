import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { Utility } from 'src/app/core/common/utility';
import { ConsultaContratoDetranRequest } from '../../../../admin/core/requests/_portal/contratos/consulta-contrato-detran.request';
import { ContratoService } from '../../../../admin/services/_portal/contrato.service';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { Store } from '@ngrx/store';
import { Clipboard } from '@angular/cdk/clipboard';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { UF } from "src/app/core/common/uf";
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { BooleanOption } from 'src/app/core/enums/boolean-option.enum';
import { PortalDominioService } from '../../../../admin/services/_portal/portal-dominio.service';
import { ValorDominio } from '../../../../admin/core/models/_portal/dominios/valor-dominio.model';
import { DominioService } from '../../../services/dominio.service';

@Component({
  selector: 'app-confirmar-registros',
  templateUrl: './confirmar-registros.component.html',
  styleUrls: ['./confirmar-registros.component.scss']
})
export class ConfirmarRegistrosComponent implements OnInit {

  utility = Utility;

  constructor(private portalDominioService: PortalDominioService,
    private fb: UntypedFormBuilder,
    private contratoService: ContratoService,
    private store: Store<{ preloader: IPreloaderState }>,
    private notifierService: NotifierService,
    private clipboard: Clipboard,
    private dominioService: DominioService) { }

  @ViewChild('form') form: FormGroupDirective;

  ufs: ValorDominio[] = [];
  formulario: FormGroup;
  pesquisarPor: any[] = [
    { palavraChave: 'CHASSI', valor: 'Chassi' },
    { palavraChave: 'NCONTRATO', valor: 'Nº de contrato' },
    { palavraChave: 'CHASSI_NCONTRATO', valor: 'Chassi + Nº de contrato' },
    { palavraChave: 'NGRAVAME', valor: 'Nº do gravame' },
    { palavraChave: 'CHASSI_NGRAVAME', valor: 'Chassi + Nº do gravame' }
  ];

  response: any = null;
  mostraChassi: boolean = false;
  mostraNumeroContrato: boolean = false;
  copiado: boolean = false;
  tiposRestricao: ValorDominio[] = [];

  ngOnInit(): void {
    this.carregarUFs();
    this.initializeForm();
  }

  submitForm() {
    if (!this.formulario.valid) return;
    this.response = null;

    this.store.dispatch(showPreloader({ payload: '' }));
    this.contratoService.consultarContratoDetran(this.montarRequest()).subscribe(response => {
      this.store.dispatch(closePreloader());

      if (response.retorno) {
        this.response = response.retorno.retorno;
        this.form.resetForm();
        return;
      }

      this.notifierService.showNotification('Nenhum registro encontrado, confirme as informações e tente novamente.', '', 'error');
    })
  }

  mostrarCampo(campo: string) {
    if (!this.formulario.get('uf').valid) return false;

    let uf = this.formulario.get('uf').value;
    let pesquisa = this.formulario.get('pesquisa').value;
    switch (campo) {
      case 'CHASSI':
        return (uf === UF.BA || uf === UF.MA || uf === UF.SP || uf === UF.SC || uf === UF.MS || pesquisa == 'CHASSI' || pesquisa == 'CHASSI_NCONTRATO' || pesquisa == 'CHASSI_NGRAVAME');

      case 'NCONTRATO':
        return (uf === UF.SC || pesquisa == 'NCONTRATO' || pesquisa == 'CHASSI_NCONTRATO');

      case 'NGRAVAME':
        return (uf === UF.SC || uf === UF.MS || pesquisa == 'NGRAVAME' || pesquisa == 'CHASSI_NGRAVAME');

      case 'NDUDA':
        return uf === UF.RJ;

      case 'REMARCADO':
        return uf === UF.SC;

      case 'TIPO_RESTRICAO':
        return uf === UF.SC;

      case 'MESANO':
        return uf === UF.MA;

      case 'ETAPA':
        return false;

      case 'NSEQUENCIAL':
        return uf === UF.MS;

      case 'DOCDEVEDOR':
        return false;

      default:
        return (uf !== UF.BA && uf !== UF.MA && uf !== UF.RJ && uf !== UF.SC && uf !== UF.SP && uf !== UF.MS && !pesquisa);
    }
  }

  mostrarTipoPesquisa(uf: string) {
    return (uf && uf !== UF.SP && uf !== UF.BA && uf !== UF.RJ && uf !== UF.SC && uf !== UF.MA && uf !== UF.MS);
  }

  copiarRetornoDetran(mensagem: string) {
    this.clipboard.copy(mensagem);
    this.copiado = true;
    Utility.waitFor(() => { this.copiado = false; }, 1000);
  }

  private initializeForm() {
    this.formulario = this.fb.group({
      uf: [null, Validators.required],
      cnpj: [null, Validators.compose([Utility.isValidCnpj, Validators.required])],
      pesquisa: [null, Validators.required],
      valorPesquisa: [{ value: null, disabled: true }, Validators.required],

      chassi: [null],
      numeroContrato: [null],
      numeroDuda: [null],
      numeroGravame: [null],
      remarcado: [null],
      tipoRestricao: [null],
      mesAno: [null],
      etapa: [null],
      numeroSequencial: [null],
      documentoDevedor: [null]
    });

    this.carregarTipoRestricao();

    this.formulario.get('uf').valueChanges.subscribe((value) => {
      this.onChangeUF(value);
    });

    this.formulario.get('pesquisa').valueChanges.subscribe(value => {
      if (value) {
        this.alterarCamposPorTipoPesquisa(value);
        return;
      }
    });
  }

  private onChangeUF(value: string) {
    this.formulario.get('cnpj').reset();
    this.formulario.get('cnpj').enable();
    this.limparValidadoresPorUF();
    this.alterarCamposPorUF();

    if (value === UF.MG) {
      this.formulario.patchValue({
        cnpj: "09016926000140",
      });
      this.formulario.get('cnpj').disable();
      this.formulario.get('cnpj').updateValueAndValidity();

      this.pesquisarPor = [
        { palavraChave: 'CHASSI_NGRAVAME', valor: 'Chassi + Nº do gravame' }
      ];
      return;
    }

    if (value === UF.AC || value === UF.AP || value === UF.PR || value === UF.RR) {
      this.pesquisarPor = [
        { palavraChave: 'CHASSI', valor: 'Chassi' },
        { palavraChave: 'CHASSI_NCONTRATO', valor: 'Chassi + Nº de contrato' }
      ];
      return;
    }

    if (value === UF.SC) {
      this.formulario.get('remarcado').patchValue(BooleanOption.SIM);
    }

    if (value === UF.MS) {
      this.formulario.get('cnpj').clearValidators();
      this.formulario.get('cnpj').updateValueAndValidity();
    }

    this.pesquisarPor = [
      { palavraChave: 'CHASSI', valor: 'Chassi' },
      { palavraChave: 'NCONTRATO', valor: 'Nº de contrato' },
      { palavraChave: 'CHASSI_NCONTRATO', valor: 'Chassi + Nº de contrato' }
    ];
  }

  private alterarCamposPorUF() {
    switch (this.formulario.get('uf').value) {
      case UF.BA:
        this.habilitarControls(['chassi']);
        return;

      case UF.SP:
        this.habilitarControls(['chassi']);
        return;

      case UF.MA:
        this.habilitarControls(['chassi', 'mesAno']);
        return;

      case UF.RJ:
        this.habilitarControls(['numeroDuda']);
        return;

      case UF.SC:
        this.habilitarControls(['remarcado', 'tipoRestricao', 'chassi', 'numeroContrato', 'numeroGravame']);
        return;

      case UF.MS:
        this.habilitarControls(['chassi', 'numeroGravame', 'numeroSequencial']);
        return;

      default:
        this.habilitarControls(['pesquisa']);
        return;
    }
  }

  private limparValidadoresPorUF() {
    switch (this.formulario.get('uf').value) {
      case UF.BA:
        this.limparValidadores(['numeroContrato', 'numeroGravame', 'numeroDuda', 'pesquisa', 'remarcado', 'tipoRestricao', 'mesAno', 'etapa', 'numeroSequencial', 'documentoDevedor']);
        return;

      case UF.SP:
        this.limparValidadores(['numeroContrato', 'numeroGravame', 'numeroDuda', 'pesquisa', 'remarcado', 'tipoRestricao', 'mesAno', 'etapa', 'numeroSequencial', 'documentoDevedor']);
        return;

      case UF.MA:
        this.limparValidadores(['numeroContrato', 'numeroGravame', 'numeroDuda', 'pesquisa', 'remarcado', 'tipoRestricao', 'etapa', 'numeroSequencial', 'documentoDevedor']);
        return;

      case UF.RJ:
        this.limparValidadores(['chassi', 'numeroGravame', 'numeroContrato', 'pesquisa', 'remarcado', 'tipoRestricao', 'mesAno', 'etapa', 'numeroSequencial', 'documentoDevedor']);
        return;

      case UF.SC:
        this.limparValidadores(['pesquisa', 'numeroDuda', 'mesAno', 'etapa', 'numeroSequencial', 'documentoDevedor']);
        return;

      case UF.MS:
        this.limparValidadores(['pesquisa', 'numeroContrato', 'numeroDuda', 'mesAno', 'remarcado', 'tipoRestricao', 'mesAno']);
        return;

      default:
        this.limparValidadores(['chassi', 'numeroContrato', 'numeroGravame', 'numeroDuda', 'remarcado', 'tipoRestricao', 'mesAno', 'etapa', 'numeroSequencial', 'documentoDevedor']);
        return;
    }
  }

  private alterarCamposPorTipoPesquisa(palavraChave: string) {
    switch (palavraChave) {
      case 'CHASSI':
        this.limparValidadores(['numeroContrato', 'numeroDuda']);
        this.habilitarControls(['chassi']);
        return;

      case 'NCONTRATO':
        this.limparValidadores(['chassi', 'numeroDuda']);
        this.habilitarControls(['numeroContrato']);
        return;

      case 'CHASSI_NCONTRATO':
        this.limparValidadores(['numeroDuda']);
        this.habilitarControls(['chassi', 'numeroContrato']);
        return;

      case 'NGRAVAME':
        this.limparValidadores(['chassi', 'numeroContrato', 'numeroDuda']);
        this.habilitarControls(['numeroGravame']);
        return;

      case 'CHASSI_NGRAVAME':
        this.limparValidadores(['numeroContrato', 'numeroDuda']);
        this.habilitarControls(['chassi', 'numeroGravame']);
        return;
    }
  }

  private limparValidadores(controls: string[]) {
    for (let i = 0; i < controls.length; i++) {
      this.formulario.get(controls[i]).reset();
      Utility.changeFieldValidators(this.formulario, controls[i], [Validators.nullValidator]);
    }
  }

  private habilitarControls(controls: string[]) {
    for (let i = 0; i < controls.length; i++) {
      Utility.changeFieldValidators(this.formulario, controls[i], [Validators.required]);
    }
  }

  private carregarUFs() {
    this.dominioService.obterPorTipo('UF_DETRAN').subscribe(response => {
      this.ufs = response.valorDominio;
    })
  }

  private montarRequest(): ConsultaContratoDetranRequest {
    let request = <ConsultaContratoDetranRequest>{
      uf: this.formulario.get('uf').value,
      cnpjAgente: this.formulario.get('cnpj').value,
      chassi: this.formulario.get('chassi').value,
      numContrato: this.formulario.get('numeroContrato').value,
      duda: this.formulario.get('numeroDuda').value
    };

    if (this.formulario.get('numeroGravame').value) { request.numGravame = this.formulario.get('numeroGravame').value; }
    if (this.formulario.get('remarcado').value != null) { request.remarcacao = this.formulario.get('remarcado').value == 'true' ? 1 : 2; }
    if (this.formulario.get('tipoRestricao').value != null) { request.tipoGravame = this.formulario.get('tipoRestricao').value; }
    if (this.formulario.get('mesAno').value != null) { request.mesAno = this.formulario.get('mesAno').value; }
    if (this.formulario.get('etapa').value != null) { request.etapa = this.formulario.get('etapa').value; }
    if (this.formulario.get('numeroSequencial').value != null) { request.numeroSequencial = this.formulario.get('numeroSequencial').value; }
    if (this.formulario.get('documentoDevedor').value != null) { request.documentoDevedor = this.formulario.get('documentoDevedor').value; }

    return request;
  }

  private carregarTipoRestricao() {
    this.tiposRestricao = [];

    this.portalDominioService.obterPorTipo('TIPO_RESTRICAO').subscribe(response => {
      response.valorDominio.forEach(value => {
        this.tiposRestricao.push(<ValorDominio>{
          id: this.obterTipoRestricaoId(value.palavraChave),
          palavraChave: value.palavraChave,
          valor: value.valor
        })
      })
    });
  }

  private obterTipoRestricaoId(palavraChave: string): number {
    if (palavraChave === 'TR_ARRENDAMENTO_MERCANTIL') { return 1; }
    if (palavraChave === 'TR_RESERVA_DOMINIO') { return 2; }
    if (palavraChave === 'TR_ALIENACAO_FIDUCIARIO') { return 3; }
    return 4;
  }

  obterTipoRetornoConsulta(response: string) {
    try {
      let a = JSON.parse(response);
      return 1;
    } catch (e) {
      let parser = new DOMParser;
      var xmlDoc = parser.parseFromString(response, "application/xml");
      if (xmlDoc.documentElement.nodeName == "parsererror")
        return 2;
      else
        return 3;
    }
  }
}
