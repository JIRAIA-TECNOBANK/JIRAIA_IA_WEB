import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, FormGroup, Validators } from '@angular/forms';
import { Utility } from 'src/app/core/common/utility';
import { ConsultarContratoResponse } from '../../../../../../admin/core/responses/_portal/contrato/consultar-contrato.response';
import { PortalGeograficoService } from '../../../../../../admin/services/_portal/portal-geografico.service';

@Component({
  selector: 'app-dados-credor',
  templateUrl: './dados-credor.component.html',
  styleUrls: ['./dados-credor.component.scss']
})
export class DadosCredorComponent implements OnInit {

  constructor(private fb: UntypedFormBuilder,
    private geograficoService: PortalGeograficoService) { }

  @Input('contrato') contratoResponse: ConsultarContratoResponse;

  utility = Utility;
  formulario: FormGroup;
  ufsLicenciamento: string[];

  ngOnInit(): void {
    this.initializeForm();
    this.carregarUfsLicenciamento();
  }

  private initializeForm() {
    this.formulario = this.fb.group({
      agenteFinanceiro: [{ value: null, disabled: true }, Validators.compose([Validators.required, Validators.maxLength(40)])],
      agenteFinanceiroId: [{ value: null, disabled: true }],
      cnpj: [{ value: null, disabled: true }, Validators.required],
      logradouro: [{ value: null, disabled: true }, Validators.compose([Validators.required, Validators.maxLength(50)])],
      numero: [{ value: null, disabled: true }, Validators.required],
      bairro: [{ value: null, disabled: true }, Validators.compose([Validators.required, Validators.maxLength(20), Validators.pattern(/[a-zA-Z0-9\u00C0-\u017F\s]+/)])],
      municipio: [{ value: null, disabled: true }, Validators.required],
      cep: [{ value: null, disabled: true }, Validators.compose([Validators.required, Validators.minLength(8)])],
      complemento: [{ value: null, disabled: true }],
      uf: [{ value: null, disabled: true }, Validators.required],
      telefone: [{ value: null, disabled: true }, Validators.required],
      email: [{ value: null, disabled: true }],
      empresaId: [{ value: null, disabled: true }]
    });

    this.carregarCredor();
  }

  private carregarCredor() {
    this.formulario.patchValue({
      agenteFinanceiro: this.contratoResponse.credor.nomeAgenteFinanceiro,
      agenteFinanceiroId: this.contratoResponse.credor.empresaId,
      cnpj: this.contratoResponse.credor.documento.numero,
      logradouro: this.contratoResponse.credor.endereco.logradouro,
      numero: this.contratoResponse.credor.endereco.numero,
      bairro: this.contratoResponse.credor.endereco.bairro,
      municipio: this.contratoResponse.credor.endereco.municipio,
      cep: this.contratoResponse.credor.endereco.cep,
      complemento: this.contratoResponse.credor.endereco.complemento,
      uf: this.contratoResponse.credor.endereco.uf,
      telefone: this.contratoResponse.credor.contato.telefoneCompleto,
      email: this.contratoResponse.credor.contato.email,
      empresaId: this.contratoResponse.credor.empresaId
    })
  }

  private carregarUfsLicenciamento() {
    this.geograficoService.obterUfsLicenciamento().subscribe(ufs => {
      this.ufsLicenciamento = ufs.sigla;
    })
  }
}
