import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Store } from '@ngrx/store';
import { PermissoesSistema } from 'src/app/core/common/permissoes-sistema';
import { Utility } from 'src/app/core/common/utility';
import { BlocoVazio } from 'src/app/modules/sistemas/core/models/common/bloco-vazio.model';
import { TipoOperacao } from 'src/app/modules/sistemas/sub-modules/crm/core/enums/tipo-operacao.enum';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { EmpresaPrecoTbk } from '../../../../core/models/cesta-servico/cesta-empresa.model';
import { NotaDebitoEmpresa } from '../../../../core/models/empresa/nota-debito-empresa.model';
import { PrecoTbk } from '../../../../core/models/preco/preco-tbk.model';
import { TaxaDetran } from '../../../../core/models/taxa/taxa-detran.model';
import { EmpresaFaturamentoService } from '../../../../services/empresa.service';
import { DialogEditarVigenciaCestaComponent } from '../dialog-editar-vigencia-cesta/dialog-editar-vigencia-cesta.component';

@Component({
  selector: 'app-cesta-servico-empresa',
  templateUrl: './cesta-servico-empresa.component.html',
  styleUrls: ['./cesta-servico-empresa.component.scss']
})
export class CestaServicoEmpresaComponent implements OnInit {

  utility = Utility;

  @Input('listaPrecoPrivado') listaPrecoPrivado: PrecoTbk[];
  @Input('taxaDetran') taxaDetran: TaxaDetran;
  @Input('consulta') consulta: boolean;
  @Input('empresaId') empresaId: number;
  @Input('uf') uf: string;
  @Input('novoPrecoId') novoPrecoId: number;
  @Input('cadastroEmpresa') cadastroEmpresa: boolean = false;
  @Output('resumoPreco') resumoPreco: EventEmitter<PrecoTbk> = new EventEmitter<PrecoTbk>();
  @Output('salvar') salvar: EventEmitter<EmpresaPrecoTbk> = new EventEmitter<EmpresaPrecoTbk>();

  @Input('triggerSalvar') set triggerSalvar(value) {
    if (value) {
      this.onSalvar();
    }
  }

  panelOpenState = false;
  listaNomePrecos: string[];
  precoSelecionado: PrecoTbk = null;
  empresaTaxaDetranId: number = null;

  formulario = this.fb.group({
    preco: [null],
    emitirNota: [false],
    dataInicioVigencia: [null],
    opcaoVigencia: [null]
  });

  blocoVazio: BlocoVazio = {
    id: 'cesta-servico',
    icone: './../../../../assets/img/custom-icons/icon-vazio-cesta.svg',
    subtitulo: `Nenhuma cesta de serviço foi selecionada.`,
    mensagem: ''
  };

  constructor(private fb: FormBuilder,
    private empresaFaturamentoService: EmpresaFaturamentoService,
    private store: Store<{ preloader: IPreloaderState }>,
    private notifierService: NotifierService,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.obterNotaDebito();
  }

  async onSalvar() {
    this.store.dispatch(showPreloader({ payload: '' }));

    let erro = false;

    this.listaPrecoPrivado.forEach(async preco => {
      if (!await this.salvarPreco(preco)) erro = true;
    })

    if (erro) return false;

    this.salvarNotaDebito();
  }

  private async salvarPreco(preco: PrecoTbk) {
    let empresaPrecoTbk = <EmpresaPrecoTbk>{
      precoTecnobankId: preco.id,
      notaDebito: this.formulario.value.emitirNota,
      criadoPor: PermissoesSistema.retornarNomeUsuario,
      uf: this.uf,
      empresaId: +this.empresaId,
      dataInicioVigencia: preco.dataInicioVigencia,
      opcaoVigencia: preco.opcaoVigencia
    };

    if (!this.consulta || this.cadastroEmpresa) {
      if (!await this.relacionarEmpresaPrecoTecnobank(empresaPrecoTbk)) {
        this.store.dispatch(closePreloader());
        return false;
      }
    }
    else if (!await this.editarEmpresaPreco(empresaPrecoTbk)) {
      this.store.dispatch(closePreloader());
      return false;
    }
  }

  editarInicioVigencia(preco: PrecoTbk) {
    const dialogRef = this.dialog.open(DialogEditarVigenciaCestaComponent, {
      width: '70%',
      data: {
        preco: preco
      }
    });

    dialogRef.afterClosed().subscribe(confirmacao => {
      if (confirmacao) {
        preco.dataInicioVigencia = confirmacao.dataInicioVigencia;
        preco.opcaoVigencia = confirmacao.periodoVigencia;
      }
    })
  }

  private async editarEmpresaPreco(empresaPrecoTbk: EmpresaPrecoTbk) {
    return await this.empresaFaturamentoService.editarPrecoPrivadoEmpresa(empresaPrecoTbk).toPromise()
      .then(response => {
        if (response.empresaPrecoTecnobankId != null) {
          return true;
        }

        if (response.errors[0].message == 'Não é possível trocar a cesta de serviço para ela mesma.') {
          return true;
        }

        this.notifierService.showNotification(response.errors[0].message, null, 'error');
        return false;
      });
  }

  private async relacionarEmpresaPrecoTecnobank(empresaPrecoTbk: EmpresaPrecoTbk) {
    return await this.empresaFaturamentoService.criarEmpresaPrecoTecnobank(empresaPrecoTbk).toPromise()
      .then(response => {
        if (response.empresaPrecoTecnobankId != null) {
          return true;
        }

        this.notifierService.showNotification(response.errors[0].message, null, 'error');
        return false;
      });
  }

  private salvarNotaDebito() {
    let notaDebito = <NotaDebitoEmpresa>{
      empresaId: this.empresaId,
      notaDebito: this.formulario.get('emitirNota').value,
      uf: this.uf
    };

    if (this.empresaTaxaDetranId) {
      this.editarNotaDebitoEmpresa(notaDebito);
    }
    else { this.criarNotaDebitoEmpresa(notaDebito); }

    this.store.dispatch(closePreloader());
  }

  private obterNotaDebito() {
    this.empresaTaxaDetranId = null;

    this.empresaFaturamentoService.obterEmitirNotaDebitoPorEmpresa(this.empresaId, this.uf).subscribe(response => {
      if (response.empresaId) {
        this.empresaTaxaDetranId = response.empresaTaxaDetranId;
        this.formulario.get('emitirNota').patchValue(response.notaDebito);
      }
    });
  }

  private criarNotaDebitoEmpresa(notaDebito: NotaDebitoEmpresa) {
    this.empresaFaturamentoService.criarNotaDebitoPorEmpresa(notaDebito).subscribe(response => {
      if (response.empresaTaxaDetranId) {
        this.sucesso();
        return;
      }

      this.erro(response.errors[0].message);
    });
  }

  private editarNotaDebitoEmpresa(notaDebito: NotaDebitoEmpresa) {
    this.empresaFaturamentoService.editarNotaDebitoPorEmpresa(this.empresaTaxaDetranId, notaDebito).subscribe(response => {
      if (response.empresaId) {
        this.sucesso();
        return;
      }

      this.erro(response.errors[0].message);
    });
  }

  private sucesso() {
    this.store.dispatch(closePreloader())
    this.salvar.emit();
  }

  private erro(mensagem: string) {
    this.notifierService.showNotification(mensagem, null, 'error');
  }

  ngOnChanges() {
    this.agruparPrecos();
    if (this.novoPrecoId) { this.formulario.get('preco').patchValue(this.novoPrecoId); }
    else {
      this.formulario.get('preco').patchValue(this.listaPrecoPrivado[0]?.id);
      this.formulario.get('dataInicioVigencia').patchValue(this.listaPrecoPrivado[0]?.dataInicioVigencia);
      this.formulario.get('opcaoVigencia').patchValue(this.listaPrecoPrivado[0]?.opcaoVigencia);
    }
  }

  private agruparPrecos() {
    this.listaNomePrecos = this.listaPrecoPrivado.map(item => item.nome);
  }

  retornarVigenciaPorNome(nome: string) {
    return this.listaPrecoPrivado.filter(c => c.nome === nome)[0].dataInicioVigencia;
  }

  retornarPrecoPorNome(nome: string) {
    return this.listaPrecoPrivado.filter(c => c.nome === nome);
  }

  retornarValorOperacao(preco: PrecoTbk, operacaoId: TipoOperacao) {
    return preco.operacoes?.filter(t => t.operacaoId === operacaoId)[0]?.valorTaxa;
  }

  retornarOperacaoAtivo(preco: PrecoTbk, operacaoId: TipoOperacao) {
    return preco.operacoes?.filter(t => t.operacaoId === operacaoId)[0]?.ativo || false;
  }

  retornarTaxaDetranOperacao(operacaoId: TipoOperacao) {
    return this.taxaDetran?.operacoes?.filter(o => o.operacaoId == operacaoId)[0]?.valorTaxa;
  }

  retornarTotalOperacao(preco: PrecoTbk, operacaoId: TipoOperacao) {
    let valorTaxa = this.taxaDetran?.operacoes?.filter(o => o.operacaoId == operacaoId)[0]?.valorTaxa || 0;
    return (+(valorTaxa + preco.operacoes?.filter(t => t.operacaoId === operacaoId)[0]?.valorTaxa)) || 0;
  }
}
