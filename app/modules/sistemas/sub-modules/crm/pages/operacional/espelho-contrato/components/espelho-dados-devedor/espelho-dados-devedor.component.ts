import { Component, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Utility } from 'src/app/core/common/utility';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { DialogCustomService } from 'src/app/shared/services/dialog-custom.service';
import { Devedor } from '../../../../../../admin/core/models/_portal/contratos/devedor.model';
import { ConsultarContratoResponse } from '../../../../../../admin/core/responses/_portal/contrato/consultar-contrato.response';
import { NotificacaoService } from '../../../../../services/notificacao.service';
import { ContratoService } from '../../../../../../admin/services/_portal/contrato.service';
import { ProdutosService } from '../../../../../services/produtos.service';
import { LiberarAcessos } from 'src/app/modules/sistemas/core/models/common/liberar-acessos.model';

@Component({
  selector: 'app-espelho-dados-devedor',
  templateUrl: './espelho-dados-devedor.component.html',
  styleUrls: ['./espelho-dados-devedor.component.scss']
})
export class EspelhoDadosDevedorComponent implements OnInit {


  constructor(
    private contratoService: ContratoService,
    public dialog: MatDialog,
    private dialogService: DialogCustomService,
    private produtosService: ProdutosService,
    private notificacaoService: NotificacaoService,
    private notifierService: NotifierService
  ) { }

  contrato: ConsultarContratoResponse;
  devedorDocumento: string = "-"
  devedorCep: string = "-"
  produtoId: number = null;
  dadosDevedor: Devedor = null;
  disableLiberacao: boolean = false;

  ngOnInit(): void {
    this.contratoService.contrato$.subscribe(contrato => {
      if (contrato != undefined) {
        this.contrato = contrato;
        this.setDadosDevedor(contrato.devedor);
      }
      else this.contrato = new ConsultarContratoResponse();
    });

    this.setProdutoId();
  }

  liberarAcesso(event: LiberarAcessos) {
    this.notificacaoService.liberarAcessoDadosDevedor(this.contrato.contrato.protocolo, event.solicitanteId, event.solicitanteValor, this.produtoId).subscribe(result => {
      if (result.errors) {
        this.notifierService.showNotification(result.errors[0].message, null, 'error');
        return;
      }

      this.getDadosDevedor();
    });
  }

  setProdutoId() {
    this.produtosService.obterProdutos().subscribe(result => {
      if (result.totalItems > 0) {
        let produto = result.produtos.filter(produto => produto.nome == 'eContrato')[0];
        this.produtoId = produto.id;
      }
    });
  }

  private getDadosDevedor() {
    this.contratoService.consultarDadosDevedor(this.contrato.contrato.protocolo).subscribe(response => {
      if (response.errors) {
        this.notifierService.showNotification(response.errors[0].message, null, 'error');
        return;
      }

      this.setDadosDevedor(response.devedor);
    });
  }

  private setDadosDevedor(devedor) {
    this.dadosDevedor = devedor;

    if (this.dadosDevedor.documento.numero.includes('*')) {
      this.disableLiberacao = false;
    }
    else { this.disableLiberacao = true; }

    if (this.dadosDevedor.documento?.tipoDocumento !== null && !this.dadosDevedor.documento.numero.includes('*')) {
      this.devedorDocumento = Utility.formatDocument(this.dadosDevedor?.documento);
    }
    else if (this.dadosDevedor.documento.numero.includes('*')) { this.devedorDocumento = this.dadosDevedor?.documento.numero; }

    if (this.dadosDevedor?.endereco?.cep !== null) { this.devedorCep = Utility.formatCep(this.dadosDevedor?.endereco?.cep); }
  }

}
