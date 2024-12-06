import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, FormGroup, Validators } from '@angular/forms';
import { Utility } from 'src/app/core/common/utility';
import { ConsultarContratoResponse } from '../../../../../../admin/core/responses/_portal/contrato/consultar-contrato.response';
import { TipoDocumento } from 'src/app/core/enums/tipo-documento.enum';
import { BooleanOption } from 'src/app/core/enums/boolean-option.enum';
import { Documento } from 'src/app/modules/sistemas/core/models/documento.model';

@Component({
  selector: 'app-dados-complementares',
  templateUrl: './dados-complementares.component.html',
  styleUrls: ['./dados-complementares.component.scss']
})
export class DadosComplementaresComponent implements OnInit {

  constructor(private fb: UntypedFormBuilder) { }

  @Input('contrato') contratoResponse: ConsultarContratoResponse;

  utility = Utility;
  formulario: FormGroup;

  ngOnInit(): void {
    this.initializeForm();
  }

  mascaraDocumento(tipoDocumento: string): string {
    if (tipoDocumento == TipoDocumento.Cpf)
      return Documento.mascaraCPF();

    return Documento.mascaraCNPJ();
  }

  private initializeForm(): void {
    this.formulario = this.fb.group({
      taxaContrato: [{ value: 350, disabled: true }],
      taxaIof: [{ value: '000', disabled: true }],
      taxaJurosMes: [{ value: '0', disabled: true }],
      taxaJurosAno: [{ value: '0', disabled: true }],
      indice: [{ value: null, disabled: true }, Validators.required],
      nomeRecebedorPagamento: [{ value: null, disabled: true }],
      tipoDocumentoRecebedor: [{ value: TipoDocumento.Cpf, disabled: true }],
      documentoRecebedor: [{ value: null, disabled: true }, Validators.compose([Utility.isValidCpf()])],
      tipoDocumentoVendedor: [{ value: TipoDocumento.Cpf, disabled: true }],
      documentoVendedor: [{ value: null, disabled: true }, Validators.compose([Utility.isValidCpf()])],
      indicadorTaxaMora: [{ value: BooleanOption.NAO, disabled: true }, Validators.required],
      valorTaxaMora: [{ value: '0', disabled: true }],
      indicadorTaxaMulta: [{ value: BooleanOption.NAO, disabled: true }, Validators.required],
      valorTaxaMulta: [{ value: '0', disabled: true }],
      indicadorComissao: [{ value: BooleanOption.NAO, disabled: true }, Validators.required],
      comissao: [{ value: '0', disabled: true }],
      indicadorPenalidade: [{ value: BooleanOption.NAO, disabled: true }, Validators.required],
      penalidade: [{ value: 'CONFORME CLAUSULAS CONTRATUAIS', disabled: true }],
      comentario: [{ value: null, disabled: true }, Validators.maxLength(1000)]
    });

    this.carregaContrato();
  }

  carregaContrato() {
    this.formulario.patchValue({
      taxaContrato: this.contratoResponse.complementar.taxaContrato,
      taxaIof: this.contratoResponse.complementar.taxaIof,
      taxaJurosMes: this.contratoResponse.complementar.taxaJurosMes,
      taxaJurosAno: this.contratoResponse.complementar.taxaJurosAno,
      indice: this.contratoResponse.complementar.indice,
      nomeRecebedorPagamento: this.contratoResponse.complementar.nomeRecebedorPagamento,
      tipoDocumentoRecebedor: this.contratoResponse.complementar.documentoRecebedor.tipoDocumento ? (this.contratoResponse.complementar.documentoRecebedor.tipoDocumento == 1 ? TipoDocumento.Cpf : TipoDocumento.Cnpj) : null,
      documentoRecebedor: this.contratoResponse.complementar.documentoRecebedor.numero,
      tipoDocumentoVendedor: this.contratoResponse.complementar.documentoVendedor.tipoDocumento ? (this.contratoResponse.complementar.documentoVendedor.tipoDocumento == 1 ? TipoDocumento.Cpf : TipoDocumento.Cnpj) : null,
      documentoVendedor: this.contratoResponse.complementar.documentoVendedor.numero,
      indicadorTaxaMora: this.contratoResponse.complementar.indicadorTaxaMora ? BooleanOption.SIM : BooleanOption.NAO,
      valorTaxaMora: this.contratoResponse.complementar.valorTaxaMora,
      indicadorTaxaMulta: this.contratoResponse.complementar.indicadorTaxaMulta ? BooleanOption.SIM : BooleanOption.NAO,
      valorTaxaMulta: this.contratoResponse.complementar.valorTaxaMulta,
      indicadorComissao: this.contratoResponse.complementar.indicadorComissao ? BooleanOption.SIM : BooleanOption.NAO,
      comissao: this.contratoResponse.complementar.comissao,
      indicadorPenalidade: this.contratoResponse.complementar.indicadorPenalidade ? BooleanOption.SIM : BooleanOption.NAO,
      penalidade: this.contratoResponse.complementar.penalidade,
      comentario: this.contratoResponse.complementar.comentario
    })
  }

}
