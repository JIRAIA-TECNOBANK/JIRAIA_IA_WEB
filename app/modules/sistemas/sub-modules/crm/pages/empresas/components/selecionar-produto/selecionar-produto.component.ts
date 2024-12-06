import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, FormControl } from '@angular/forms';
import { ProdutosService } from '../../../../services/produtos.service';
import { Produtos } from '../../../../core/models/produtos/produtos.model';
import { ActivatedRoute } from '@angular/router';
import { EmpresasService } from '../../../../services/empresas.service';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';

@Component({
  selector: 'app-selecionar-produto',
  templateUrl: './selecionar-produto.component.html',
  styleUrls: ['./selecionar-produto.component.scss'],
})
export class SelecionarProdutoComponent implements OnInit {
  @Output() nextTab: EventEmitter<boolean>  = new EventEmitter<boolean>();
  @Input('companyId') companyId: any;

  produtosForm = this.formBuilder.group({});
  produtos: Produtos[];
  produtoId: number;
  produtoSelecionado: Produtos = null;

  utility = Utility;
  Permissoes = Permissoes;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private produtosService: ProdutosService,
    private empresasService: EmpresasService
  ) {
    if (this.activatedRoute.snapshot.params['empresaId'] != undefined) {
      this.companyId = this.activatedRoute.snapshot.params['empresaId'];
    }
  }

  hasSelectProduct() {
    return (
      this.produtosForm.value && Object.keys(this.produtosForm.value).length
    );
  }

  ngOnInit(): void {
    this.carregaProdutos();
  }

  carregaProdutos() {
    this.produtosService.obterProdutos().subscribe((result) => {
      this.produtos = result.produtos;
      this.produtos.forEach((produto) => {
        this.produtosForm.addControl(
          'produto_' + produto.id,
          new FormControl()
        );
      });

      this.produtosForm.controls['produto_' + this.produtos[0].id].setValue(
        true
      );
    });
  }

  onSubmit() {
    let produtoId = null;
    
    Object.keys(this.produtosForm.controls).forEach((key) => {
      if (this.produtosForm.get(key).value) {
        produtoId = key.split('_')[1];
      }
    });
    
    if (produtoId != null) {
      this.produtoId = produtoId;
      this.produtoSelecionado = this.produtos.filter(
        (produto) => produto.id == produtoId
      )[0];
      this.empresasService
        .associarProdutoEmpresa(this.companyId, produtoId)
        .toPromise()
        .then((result) => {});
    }
    this.nextTab.emit()
  }
}
