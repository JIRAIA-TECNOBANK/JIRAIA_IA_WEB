import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Utility } from 'src/app/core/common/utility';
import { Especie } from 'src/app/modules/sistemas/sub-modules/crm/core/models/veiculos/especie.model';
import { EspeciesFiltro } from 'src/app/modules/sistemas/sub-modules/crm/core/models/veiculos/especies-filtro.model';
import { Modelo } from 'src/app/modules/sistemas/sub-modules/crm/core/models/veiculos/modelo.model';
import { VeiculoService } from 'src/app/modules/sistemas/sub-modules/crm/services/veiculo.service';

@Component({
  selector: 'app-dialog-adicionar-modelo',
  templateUrl: './dialog-adicionar-modelo.component.html',
  styleUrls: ['./dialog-adicionar-modelo.component.scss']
})
export class DialogAdicionarModeloComponent implements OnInit {
  utility = Utility;

  formulario = this.fb.group({
    id: [null],
    nome: [{ value: null, disabled: false }, Validators.required],
    especieId: [{ value: null, disabled: false }]
  });
  especies: Especie[];
  modelo: Modelo;

  constructor(private fb: UntypedFormBuilder, private veiculoService: VeiculoService, @Inject(MAT_DIALOG_DATA) public data: Modelo) {
    this.modelo = data;
    if (data) {
      this.formulario.get("id").patchValue(data.id);
      this.formulario.get("nome").patchValue(data.nome);
      this.formulario.get("especieId").patchValue(data.especieId);
    }
  }

  ngOnInit(): void {
    this.obterEspecies();
  }

  obterEspecies() {
    const filtro = new EspeciesFiltro();
    this.veiculoService.obterEspecieVeiculos(filtro).subscribe((result) => {
      this.especies = result.especies;
      if(this.modelo && this.modelo.especieId) {
        this.formulario.get("especieId").patchValue(this.modelo.especieId);
      }
    });
  }
}
