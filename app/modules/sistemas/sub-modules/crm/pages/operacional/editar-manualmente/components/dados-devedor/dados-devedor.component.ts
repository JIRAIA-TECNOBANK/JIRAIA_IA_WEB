import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, FormGroup, Validators } from '@angular/forms';
import { Utility } from 'src/app/core/common/utility';
import { ConsultarContratoResponse } from '../../../../../../admin/core/responses/_portal/contrato/consultar-contrato.response';
import { PortalGeograficoService } from '../../../../../../admin/services/_portal/portal-geografico.service';
import { TipoDocumento } from 'src/app/core/enums/tipo-documento.enum';
import { Documento } from 'src/app/modules/sistemas/core/models/documento.model';

@Component({
  selector: 'app-dados-devedor',
  templateUrl: './dados-devedor.component.html',
  styleUrls: ['./dados-devedor.component.scss']
})
export class DadosDevedorComponent implements OnInit {

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

  mascaraDocumento(tipoDocumento: string): string {
    if (tipoDocumento == TipoDocumento.Cpf)
      return Documento.mascaraCPF();

    return Documento.mascaraCNPJ();
  }

  private initializeForm() {
    this.formulario = this.fb.group({
      nomeDoFinanciado: [{ value: null, disabled: true }, Validators.compose([Validators.required, Validators.maxLength(40)])],
      tipoDocumento: [{ value: TipoDocumento.Cpf, disabled: true }, Validators.required],
      documento: [{ value: null, disabled: true }, Validators.compose([Validators.required, Utility.isValidCpf()])],
      logradouro: [{ value: null, disabled: true }, Validators.compose([Validators.required, Validators.maxLength(50)])],
      numero: [{ value: null, disabled: true }, Validators.compose([Validators.required, Validators.maxLength(5)])],
      bairro: [{ value: null, disabled: true }, Validators.compose([Validators.required, Validators.maxLength(20), Validators.pattern(/[a-zA-Z0-9\u00C0-\u017F\s]+/)])],
      municipio: [{ value: null, disabled: true }, Validators.compose([Validators.required, Validators.maxLength(30)])],
      cep: [{ value: null, disabled: true }, Validators.compose([Validators.required, Validators.minLength(8)])],
      complemento: [{ value: null, disabled: true }, Validators.maxLength(20)],
      uf: [{ value: null, disabled: true }, Validators.required],
      telefone: [{ value: null, disabled: true }, Validators.required],
      email: [{ value: null, disabled: true }],
      terceiroGarantidor: [{ value: null, disabled: true }]
    });

    this.carregarDevedor();
  }

  private carregarDevedor() {
    this.formulario.patchValue({
      nomeDoFinanciado: this.contratoResponse.devedor.nomeDoFinanciado,
      tipoDocumento: this.contratoResponse.devedor.documento.tipoDocumento == 1 ? TipoDocumento.Cpf : TipoDocumento.Cnpj,
      documento: this.contratoResponse.devedor.documento.numero,
      logradouro: this.contratoResponse.devedor.endereco.logradouro,
      numero: this.contratoResponse.devedor.endereco.numero,
      bairro: this.contratoResponse.devedor.endereco.bairro,
      municipio: this.contratoResponse.devedor.endereco.municipio,
      cep: this.contratoResponse.devedor.endereco.cep,
      complemento: this.contratoResponse.devedor.endereco.complemento,
      uf: this.contratoResponse.devedor.endereco.uf,
      telefone: this.contratoResponse.devedor.contato.ddd + this.contratoResponse.devedor.contato.telefone,
      email: this.contratoResponse.devedor.contato.email,
      terceiroGarantidor: null
    });
  }

  private carregarUfsLicenciamento() {
    this.geograficoService.obterUfsLicenciamento().subscribe(ufs => {
      this.ufsLicenciamento = ufs.sigla;
    })
  }
}
