import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Utility } from 'src/app/core/common/utility';
import { ValorDominio } from '../../../../../../admin/core/models/_portal/dominios/valor-dominio.model';
import { PortalDominioService } from '../../../../../../admin/services/_portal/portal-dominio.service';
import { DominioResponse } from '../../../../../../admin/core/responses/_portal/dominios/dominio.response';
import { UntypedFormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConsultarContratoResponse } from '../../../../../../admin/core/responses/_portal/contrato/consultar-contrato.response';
import { PortalGeograficoService } from '../../../../../../admin/services/_portal/portal-geografico.service';

@Component({
  selector: 'app-dados-contrato',
  templateUrl: './dados-contrato.component.html',
  styleUrls: ['./dados-contrato.component.scss']
})
export class DadosContratoComponent implements OnInit {

  constructor(private portalDominioService: PortalDominioService,
    private fb: UntypedFormBuilder,
    private geograficoService: PortalGeograficoService) {
    this.minDate = new Date(1985, 4, 12);
    this.maxDate = new Date();
  }

  @Input('contrato') contratoResponse: ConsultarContratoResponse;
  @Output() form: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();

  utility = Utility;
  formulario: FormGroup;
  tiposRestricao: ValorDominio[] = [];
  tiposAditivo: ValorDominio[] = [];
  minDate: Date;
  maxDate: Date;
  ufsLicenciamento: string[];

  ngOnInit(): void {
    this.carregarTipoRestricao();
    this.carregarTipoAditivo();
    this.carregarUfsLicenciamento();

    this.initializeForm();
  }

  private initializeForm(): void {
    this.formulario = this.fb.group({
      numeroContrato: [{ value: null, disabled: true }, Validators.required],
      ufLicenciamento: [{ value: null, disabled: true }, Validators.required],
      tipoRestricao: [{ value: null, disabled: true }, Validators.required],
      dataContrato: [{ value: null, disabled: true }, Validators.required],
      duda: [{ value: null, disabled: true }],
      numeroAditivo: [{ value: null }, Validators.required],
      dataAditivo: [{ value: null }, Validators.required],
      tipoAditivo: [{ value: null, disabled: true }]
    });

    this.formulario.valueChanges.subscribe(() => { this.form.emit(this.formulario) });

    this.carregaContrato();
  }

  private carregaContrato() {
    this.formulario.patchValue({
      numeroContrato: this.contratoResponse.contrato.numeroContrato,
      ufLicenciamento: this.contratoResponse.contrato.ufLicenciamento,
      tipoRestricao: this.contratoResponse.contrato.tipoRestricao,
      dataContrato: this.contratoResponse.contrato.dataContrato ? Utility.formatDatePicker(this.contratoResponse.contrato.dataContrato, '/') : null,
      duda: this.contratoResponse.contrato.taxaDetran?.numero,
      numeroAditivo: this.contratoResponse.contrato.numeroAditivo,
      dataAditivo: this.contratoResponse.contrato.dataAditivo ? Utility.formatDatePicker(this.contratoResponse.contrato.dataAditivo, '/') : null,
      tipoAditivo: this.contratoResponse.contrato.tipoAditivo
    });

    this.formulario.get('numeroAditivo').markAsTouched();
    this.formulario.get('dataAditivo').markAsTouched();
  }

  private carregarUfsLicenciamento() {
    this.geograficoService.obterUfsLicenciamento().subscribe(ufs => {
      this.ufsLicenciamento = ufs.sigla;
    })
  }

  private carregarTipoRestricao() {
    this.portalDominioService.obterPorTipo('TIPO_RESTRICAO')
      .subscribe((response: DominioResponse) => {

        if (response.isSuccessful) {
          response.valorDominio.forEach((dominio: ValorDominio) => {
            this.tiposRestricao.push(dominio);
          })
        }
      })
  }

  private carregarTipoAditivo() {
    this.portalDominioService.obterPorTipo('TIPO_ADITIVO')
      .subscribe((response: DominioResponse) => {

        if (response.isSuccessful) {
          response.valorDominio.forEach((dominio: ValorDominio) => {
            this.tiposAditivo.push(dominio);
          })
        }
      })
  }
}
