import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, FormGroup, Validators } from '@angular/forms';
import { Utility } from 'src/app/core/common/utility';
import { BooleanOption } from 'src/app/core/enums/boolean-option.enum';
import { RangeValidator } from 'src/app/core/forms/validators/range.validator';
import { PortalGeograficoService } from '../../../../../../admin/services/_portal/portal-geografico.service';
import { VeiculoService } from '../../../../../../admin/services/_portal/veiculo.service';
import { ObterEspeciesResponse } from '../../../../../../admin/core/responses/_portal/veiculos/obter-especies.response';
import { Especie } from '../../../../../core/models/veiculos/especie.model';
import { Veiculo } from '../../../../../../admin/core/models/_portal/contratos/veiculo.model';
import { ConsultarContratoResponse } from '../../../../../../admin/core/responses/_portal/contrato/consultar-contrato.response';
import { MatLegacyDialog as MatDialog, MatLegacyDialogConfig as MatDialogConfig } from '@angular/material/legacy-dialog';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { DialogVerVeiculoComponent } from '../dialog-ver-veiculo/dialog-ver-veiculo.component';
import { EditarManualmenteService } from '../../../../../services/editar-manualmente.service';

@Component({
  selector: 'app-dados-veiculo',
  templateUrl: './dados-veiculo.component.html',
  styleUrls: ['./dados-veiculo.component.scss']
})
export class DadosVeiculoComponent implements OnInit {

  constructor(private fb: UntypedFormBuilder,
    private geograficoService: PortalGeograficoService,
    private veiculoService: VeiculoService,
    private dialog: MatDialog,
    private editarManualmenteService: EditarManualmenteService) { }

  @Input('contrato') contratoResponse: ConsultarContratoResponse;
  @Input() formID: string = null;
  @Input('ehFrota') set setEhFrota(value) { this.ehFrota = value; }
  @Input('carregarVeiculo') set carregarVeiculo(value) { if (value) { this.carregarVeiculoFrota(value); } }

  utility = Utility;
  formulario: FormGroup;
  ufsLicenciamento: string[];
  especiesVeiculo: Especie[] = [];

  ehFrota: boolean;

  ngOnInit(): void {
    this.initializeForm();
    this.carregarUfsLicenciamento();
  }

  private initializeForm(): void {
    this.formulario = this.fb.group({
      id: [null],
      chassi: [{ value: null, disabled: true }, Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(21)])],
      renavam: [{ value: null, disabled: true }, Validators.maxLength(11)],
      numeroRestricao: [{ value: null, disabled: true }, Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(8)])],
      placa: [{ value: null, disabled: true }, Validators.compose([Validators.minLength(5), Validators.maxLength(7)])],
      ufPlaca: [{ value: null, disabled: true }],
      anoFabricacao: [{ value: null, disabled: true }, Validators.compose([Validators.required, RangeValidator.range(1971, 2999)])],
      anoModelo: [{ value: null, disabled: true }, Validators.compose([Validators.required, RangeValidator.range(1971, 2999)])],
      remarcado: [{ value: BooleanOption.NAO, disabled: true }],
      marca: [{ value: null, disabled: true }],
      modelo: [{ value: null, disabled: true }],
      emplacado: [{ value: BooleanOption.NAO, disabled: true }],
      especie: [{ value: null, disabled: true }],
      cor: [{ value: null, disabled: true }]
    });

    if (!this.ehFrota) {
      this.carregaVeiculo();
    }
  }

  private carregaVeiculo() {
    this.formulario.patchValue({
      id: null,
      chassi: this.contratoResponse.veiculo[0].chassi,
      renavam: this.contratoResponse.veiculo[0].renavam,
      numeroRestricao: this.contratoResponse.veiculo[0].numeroRestricao,
      placa: this.contratoResponse.veiculo[0].placa,
      ufPlaca: this.contratoResponse.veiculo[0].ufPlaca,
      anoFabricacao: this.contratoResponse.veiculo[0].anoFabricacao,
      anoModelo: this.contratoResponse.veiculo[0].anoModelo,
      remarcado: this.contratoResponse.veiculo[0].remarcado ? BooleanOption.SIM : BooleanOption.NAO,
      marca: this.contratoResponse.veiculo[0].marca,
      modelo: this.contratoResponse.veiculo[0].modelo,
      emplacado: this.contratoResponse.veiculo[0].emplacado ? BooleanOption.SIM : BooleanOption.NAO,
      especie: this.contratoResponse.veiculo[0].especie,
      cor: this.contratoResponse.veiculo[0].cor
    })

    this.carregaEspecieVeiculos(this.contratoResponse.veiculo[0].especie);

    if (this.contratoResponse.veiculo.length > 1) {
      let veiculos = [];

      for (let i = 1; i < this.contratoResponse.veiculo.length; i++) {
        veiculos.push(this.contratoResponse.veiculo[i]);
      }

      this.editarManualmenteService.retornoVeiculosAdicionados(veiculos)
    }
  }

  private carregarUfsLicenciamento() {
    this.geograficoService.obterUfsLicenciamento().subscribe(ufs => {
      this.ufsLicenciamento = ufs.sigla;
    })
  }

  private carregaEspecieVeiculos(especieId: number = null) {
    this.veiculoService.obterEspecies()
      .subscribe((response: ObterEspeciesResponse) => {
        if (response.isSuccessful) {
          let setEspecie
          this.especiesVeiculo = [];
          this.especiesVeiculo = response.especies;
          if (especieId) {
            setEspecie = this.especiesVeiculo.filter((item: Especie) => { return item.id == especieId })
            this.formulario?.get('especie').setValue(setEspecie[0].id);
          }
        }
      })
  }

  private carregarVeiculoFrota(veiculo: Veiculo) {
    Utility.waitFor(() => {
      this.formulario.get('id').setValue(veiculo.id);
      this.formulario.get('chassi').setValue(veiculo.chassi);
      this.formulario.get('placa').setValue(veiculo.placa);
      this.formulario.get('ufPlaca').setValue(veiculo.ufPlaca);
      this.formulario.get('anoFabricacao').setValue(veiculo.anoFabricacao);
      this.formulario.get('anoModelo').setValue(veiculo.anoModelo);
      this.formulario.get('remarcado').setValue(`${veiculo.remarcado}`);
      this.formulario.get('renavam').setValue(veiculo.renavam);
      this.formulario.get('numeroRestricao').setValue(veiculo.numeroRestricao);
      this.formulario.get('emplacado').setValue(`${veiculo.emplacado}`);
      this.formulario.get('marca').setValue(veiculo.marca);
      this.formulario.get('modelo').setValue(veiculo.modelo);
      this.formulario.get('especie').setValue(veiculo.especie);
      this.formulario.get('cor').setValue(veiculo.cor);
    }, 1000);
  }

  verVeiculo(id: number) {
    let veiculo = this.contratoResponse.veiculo.filter(veiculo => veiculo.id == id)[0];

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = { adicionado: false, veiculo: veiculo };
    dialogConfig.id = Utility.getElementId(TipoElemento.dlg, 'editar-veiculo');
    this.dialog.open(DialogVerVeiculoComponent, dialogConfig);
  }

}
