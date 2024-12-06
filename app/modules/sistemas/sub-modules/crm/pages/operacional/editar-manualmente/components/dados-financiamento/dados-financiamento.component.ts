import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, FormGroup, Validators } from '@angular/forms';
import { Utility } from 'src/app/core/common/utility';
import { ConsultarContratoResponse } from '../../../../../../admin/core/responses/_portal/contrato/consultar-contrato.response';
import { PortalGeograficoService } from '../../../../../../admin/services/_portal/portal-geografico.service';
import { MunicipioResponse } from 'src/app/modules/sistemas/sub-modules/crm/core/responses/geograficos/municipio.response';
import { Municipio } from 'src/app/modules/sistemas/sub-modules/crm/core/models/geograficos/municipio.model';

@Component({
  selector: 'app-dados-financiamento',
  templateUrl: './dados-financiamento.component.html',
  styleUrls: ['./dados-financiamento.component.scss']
})
export class DadosFinanciamentoComponent implements OnInit {

  constructor(private fb: UntypedFormBuilder,
    private geograficoService: PortalGeograficoService) {
    this.maxDate = new Date();
  }

  @Input('contrato') contratoResponse: ConsultarContratoResponse;

  utility = Utility;
  formulario: FormGroup;
  ufsLicenciamento: string[];
  minDate: Date;
  maxDate: Date;

  ngOnInit(): void {
    this.initializeForm();
    this.carregarUfsLicenciamento();
  }

  private initializeForm() {
    this.formulario = this.fb.group({
      valorTotalDivida: [{ value: null, disabled: true }, Validators.required],
      valorParcela: [{ value: null, disabled: true }, Validators.required],
      qtdeParcela: [{ value: null, disabled: true }, Validators.required],
      dataVencimentoPrimeiraParcela: [{ value: null, disabled: true }, Validators.required],
      dataVencimentoUltimaParcela: [{ value: null, disabled: true }, Validators.required],
      dataLiberacaoCredito: [{ value: null, disabled: true }, Validators.required],
      ufLiberacaoCredito: [{ value: null, disabled: true }, Validators.required],
      idMunicipio: [{ value: null, disabled: true }, Validators.required],
      municipioLiberacaoCredito: [{ value: null, disabled: true }, Validators.required],
      cotaConsorcio: [{ value: null, disabled: true }, Validators.maxLength(6)],
      numeroGrupo: [{ value: null, disabled: true }]
    });

    this.carregarFinanciamento();
  }

  private carregarFinanciamento() {
    this.formulario.patchValue({
      valorTotalDivida: this.contratoResponse.financiamento.valorTotalDivida,
      valorParcela: this.contratoResponse.financiamento.valorParcela,
      qtdeParcela: this.contratoResponse.financiamento.quantidadeParcela,
      dataVencimentoPrimeiraParcela: this.contratoResponse.financiamento.dataVencimentoPrimeiraParcela && Utility.formatDatePicker(this.contratoResponse.financiamento.dataVencimentoPrimeiraParcela, '/'),
      dataVencimentoUltimaParcela: this.contratoResponse.financiamento.dataVencimentoUltimaParcela && Utility.formatDatePicker(this.contratoResponse.financiamento.dataVencimentoUltimaParcela, '/'),
      dataLiberacaoCredito: this.contratoResponse.financiamento.liberacaoCredito.data && Utility.formatDatePicker(this.contratoResponse.financiamento.liberacaoCredito.data, '/'),
      ufLiberacaoCredito: this.contratoResponse.financiamento.liberacaoCredito.uf,
      idMunicipio: this.contratoResponse.financiamento.idMunicipio,
      municipioLiberacaoCredito: null,
      cotaConsorcio: this.contratoResponse.financiamento.consorcio.cota,
      numeroGrupo: this.contratoResponse.financiamento.consorcio.grupo
    });

    this.filtrarMunicipio()
  }

  private filtrarMunicipio() {
    let uf = this.contratoResponse.financiamento.liberacaoCredito.uf;
    if (uf != undefined) {
      this.geograficoService.obterMunicipiosPorUf(uf)
        .subscribe((municipios: MunicipioResponse) => {
          if (this.contratoResponse.financiamento.idMunicipio > 0 && this.formulario) {
            this.formulario.get('municipioLiberacaoCredito').setValue(municipios.municipios?.filter((item: Municipio) => { return item.id == this.contratoResponse.financiamento.idMunicipio })[0]?.nome);
          }
        })
    }
  }

  private carregarUfsLicenciamento() {
    this.geograficoService.obterUfsLicenciamento().subscribe(ufs => {
      this.ufsLicenciamento = ufs.sigla;
    })
  }
}
