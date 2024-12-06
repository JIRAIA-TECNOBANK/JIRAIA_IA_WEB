import { Component, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Utility } from 'src/app/core/common/utility';
import { ValorDominio } from 'src/app/modules/sistemas/sub-modules/admin/core/models/_portal/dominios/valor-dominio.model';
import { DominioService } from 'src/app/modules/sistemas/sub-modules/crm/services/dominio.service';
import { SortByPipe } from 'src/app/shared/pipes/sort-by.pipe';
import { PesquisaConsultaDetran } from '../../../../core/models/consultar-detran/pesquisa-consulta-detran.model';

@Component({
  selector: 'app-consultar-detran',
  templateUrl: './consultar-detran.component.html',
  styleUrls: ['./consultar-detran.component.scss']
})
export class ConsultarDetranComponent implements OnInit {

  utility = Utility;
  ufs: ValorDominio[] = [];
  formulario: FormGroup;
  filtro: PesquisaConsultaDetran = null;
  sortPipe = new SortByPipe();
  possuiResultado: boolean = false;
  exportarArquivos: boolean = null;

  constructor(private fb: UntypedFormBuilder, private dominioService: DominioService) { }

  ngOnInit(): void {
    this.carregarUFs();
    this.initializeForm();
  }

  submitForm() {
    if (!this.formulario.valid) return;

    this.filtro = <PesquisaConsultaDetran>{
      uf: this.formulario.get('uf').value,
      mesCompetencia: this.formulario.get('mes').value,
      ano: this.formulario.get('ano').value,
      cnpj: this.formulario.get('cnpj').value
    };
  }

  retornarAnoAtual() {
    return new Date().getFullYear();
  }

  private initializeForm() {
    this.formulario = this.fb.group({
      uf: [null, Validators.required],
      cnpj: [null, Utility.isValidCnpj],
      mes: [null, Validators.required],
      ano: [null, Validators.required]
    });
  }

  private carregarUFs() {
    this.dominioService.obterPorTipo('UF_DETRAN').subscribe(response => {
      this.ufs = this.sortPipe.transform(response.valorDominio.filter(valor => valor), 'asc', 'valor');
    })
  }
}
