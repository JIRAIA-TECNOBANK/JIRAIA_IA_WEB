import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatLegacyDialog as MatDialog, MatLegacyDialogConfig as MatDialogConfig } from '@angular/material/legacy-dialog';
import { Store } from '@ngrx/store';
import { from } from 'rxjs';
import { PermissoesSistema } from 'src/app/core/common/permissoes-sistema';
import { Utility } from 'src/app/core/common/utility';
import { BlocoVazio } from 'src/app/modules/sistemas/core/models/common/bloco-vazio.model';
import { EmpresaPrecoTbk } from 'src/app/modules/sistemas/sub-modules/faturamento/core/models/cesta-servico/cesta-empresa.model';
import { EditarCesta } from 'src/app/modules/sistemas/sub-modules/faturamento/core/models/cesta-servico/editar-cesta.mode';
import { NotaDebitoEmpresa } from 'src/app/modules/sistemas/sub-modules/faturamento/core/models/empresa/nota-debito-empresa.model';
import { PrecoTbk } from 'src/app/modules/sistemas/sub-modules/faturamento/core/models/preco/preco-tbk.model';
import { TaxaDetran } from 'src/app/modules/sistemas/sub-modules/faturamento/core/models/taxa/taxa-detran.model';
import { DialogPesquisaCestaComponent } from 'src/app/modules/sistemas/sub-modules/faturamento/pages/empresas/components/dialog-pesquisa-cesta/dialog-pesquisa-cesta.component';
import { EmpresaFaturamentoService } from 'src/app/modules/sistemas/sub-modules/faturamento/services/empresa.service';
import { PrecoService } from 'src/app/modules/sistemas/sub-modules/faturamento/services/preco.service';
import { DialogAlertaConteudoComponent } from 'src/app/shared/components/dialog-alerta-conteudo/dialog-alerta-conteudo.component';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';

@Component({
  selector: 'app-consultar-preco-privado',
  templateUrl: './consultar-preco-privado.component.html',
  styleUrls: ['./consultar-preco-privado.component.scss']
})
export class ConsultarPrecoPrivadoComponent {

  @Input('uf') uf: string = null;
  @Input('empresaId') empresaId: number = null;
  @Input('taxaDetran') taxaDetran: TaxaDetran;
  @Input('cadastroEmpresa') cadastroEmpresa: boolean = false;
  @Input('triggerSalvar') set triggerSalvar(value) {
    if (value) {
      this.onSalvar();
    }
  }

  @Output('fechar') fechar: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output('possuiPrecoSelecionado') possuiPrecoSelecionado: EventEmitter<boolean> = new EventEmitter<boolean>();

  utility = Utility;

  constructor(
    private fb: UntypedFormBuilder,
    private empresaFaturamentoService: EmpresaFaturamentoService,
    private store: Store<{ preloader: IPreloaderState }>,
    private notifierService: NotifierService,
    private dialog: MatDialog,
    private precoService: PrecoService) { }

  formulario = this.fb.group({
    emitirNota: [false]
  });

  listaPrecoPrivado: PrecoTbk[] = [];
  precosSelecionados: PrecoTbk[] = [];

  consultaPreco: boolean = false;
  novoPrecoId: number = null;
  precoSalvoId: number = null;
  precosSalvos: PrecoTbk[];

  cestasInclusao: EmpresaPrecoTbk[] = [];
  cestasEdicao: EditarCesta[] = [];
  precosInclusos: EmpresaPrecoTbk[] = [];
  empresaTaxaDetranId: number = null;

  blocoVazio: BlocoVazio = {
    id: 'cesta-servico',
    icone: './../../../../assets/img/custom-icons/icon-vazio-cesta.svg',
    subtitulo: `Nenhuma cesta de serviço foi selecionada.`,
    mensagem: ''
  };

  pipe = new DatePipe('pt-BR');

  ngOnInit() {
    this.obterPrecosPrivados();
    this.obterNotaDebito();
  }

  cancelar() {
    this.fechar.emit(true);
  }

  abrirModalPesquisa() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '70%';
    let lista = this.listaPrecoPrivado;

    if (this.consultaPreco) {
      lista = this.listaPrecoPrivado.filter(p => !this.precosSelecionados.map(s => s.id).includes(p.id));
    }

    lista = Utility.sortValues(lista, 'nome');

    dialogConfig.data = {
      listaPrecos: lista,
      taxaDetran: this.taxaDetran,
      consultaPreco: this.consultaPreco
    };

    const dialogRef = this.dialog.open(
      DialogPesquisaCestaComponent,
      dialogConfig
    );

    dialogRef.afterClosed().subscribe((formularioValores: any) => {
      if (!formularioValores) return;

      let precoSelecionado = formularioValores.preco;

      if (precoSelecionado) {
        let selecionado = this.listaPrecoPrivado.filter(c => c.id === precoSelecionado)[0];
        selecionado.dataInicioVigencia = new Date(formularioValores.dataInicioVigencia);
        selecionado.dataInicioVigencia.setHours(0, 0, 0);
        selecionado.opcaoVigencia = formularioValores.periodoVigencia;

        let datasIguais = this.verificarDatasIguais(selecionado);
        if (datasIguais) {
          this.mostrarModalSubstituicao(selecionado, datasIguais);
          return;
        }

        this.cestasInclusao.push(<EmpresaPrecoTbk>{
          precoTecnobankId: selecionado.id,
          notaDebito: this.formulario.value.emitirNota,
          criadoPor: PermissoesSistema.retornarNomeUsuario,
          uf: this.uf,
          empresaId: +this.empresaId,
          dataInicioVigencia: selecionado.dataInicioVigencia,
          opcaoVigencia: selecionado.opcaoVigencia
        });

        this.adicionarSelecionado(selecionado);
      }
    });
  }

  verificarAprovacao(id: number) {
    let precoIncluso = this.precosInclusos.filter(p => p.precoTecnobankId == id);

    if (precoIncluso.length > 0) {
      return precoIncluso[0].aprovado;
    }

    return false;
  }

  private verificarDatasIguais(selecionado: PrecoTbk): PrecoTbk | null {
    let datasInicio = this.precosSelecionados.map(s => this.formatarData(s.dataInicioVigencia));
    if (datasInicio.includes(this.formatarData(selecionado.dataInicioVigencia))) { // usuario selecionou a mesma data de uma cesta ja cadastrada
      let mesmaData = this.precosSelecionados.filter(p => this.formatarData(p.dataInicioVigencia) == this.formatarData(selecionado.dataInicioVigencia))[0];

      if (mesmaData) {
        // this.mostrarModalSubstituicao(selecionado, mesmaData);
        return mesmaData;
      }
    }

    return null;
  }

  private mostrarModalSubstituicao(selecionado: PrecoTbk, precoSelecionado: PrecoTbk) {
    let mensagem = `<span>A data de início selecionada para vigência dessa cesta de serviço é a mesma cadastrada em outra cesta já atribuída a essa empresa.</span>
                  <span>Ao confirmar essa nova atribuição, essa nova cesta irá  sobrepor a anterior por possuírem a mesma vigência.</span><br>
                  <span class='bold'>Confirma a alteração?</span>`;

    const dialogRef = this.dialog.open(DialogCustomComponent, {
      width: '450px',
      data: {
        component: DialogAlertaConteudoComponent,
        conteudo: mensagem,
        titleClass: 'd-none',
        buttonCancel: {
          value: false,
          text: 'Cancelar',
        },
        buttonConfirm: {
          value: true,
          text: 'Confirmar',
        }
      },
    });

    dialogRef.afterClosed().subscribe(confirmacao => {
      if (confirmacao) {
        this.substituicaoPreco(selecionado, precoSelecionado);
        return;
      }
    })
  }

  private mostrarModalInformativoMesmaData(mesmaData: PrecoTbk) {
    let mensagem = `<span class='bold'>Não foi possível realizar a alteração.</span>
                    <span>A data de início selecionada para vigência dessa cesta de serviço é a mesma 
                    cadastrada na cesta <b>${mesmaData.nome}</b> já atribuída a essa empresa.</span>`;

    this.dialog.open(DialogCustomComponent, {
      width: '500px',
      data: {
        component: DialogAlertaConteudoComponent,
        conteudo: mensagem,
        titleClass: 'd-none',
        buttonCancel: {
          value: false,
          text: '',
        },
        buttonConfirm: {
          value: true,
          text: 'Entendi',
        },
        disableCancelBtn: true
      },
    });
  }

  private formatarData(data: string | Date) {
    return this.pipe.transform(new Date(data), 'yyyy-MM-dd');
  }

  private substituicaoPreco(selecionado: PrecoTbk, precoSelecionado: PrecoTbk) {
    let indexPreco = this.precosSelecionados.indexOf(precoSelecionado);
    let inclusao = this.cestasInclusao.filter(i => i.precoTecnobankId == precoSelecionado.id)[0];

    if (inclusao) {
      let index = this.cestasInclusao.indexOf(inclusao);
      this.cestasInclusao.splice(index, 1);

      this.cestasInclusao.push(<EmpresaPrecoTbk>{
        precoTecnobankId: selecionado.id,
        notaDebito: this.formulario.value.emitirNota,
        criadoPor: PermissoesSistema.retornarNomeUsuario,
        uf: this.uf,
        empresaId: +this.empresaId,
        dataInicioVigencia: selecionado.dataInicioVigencia,
        opcaoVigencia: selecionado.opcaoVigencia
      });
    }
    else {
      let precoIncluso = this.precosInclusos.filter(p => p.precoTecnobankId == precoSelecionado.id)[0];

      if (precoIncluso) {
        let edicao = this.cestasEdicao.filter(i => i.idEditado == precoIncluso.id)[0];

        if (edicao) {
          let index = this.cestasEdicao.indexOf(edicao);
          this.cestasEdicao.splice(index, 1);
        }

        this.cestasEdicao.push(<EditarCesta>{
          idEditado: precoIncluso.id,
          precoTecnobankId: selecionado.id,
          dataInicioVigencia: selecionado.dataInicioVigencia,
          opcaoVigencia: selecionado.opcaoVigencia
        });
      }
    }

    this.precosSelecionados.splice(indexPreco, 1)
    this.adicionarSelecionado(selecionado);
  }

  abrirModalEditarCesta(preco: PrecoTbk) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '70%';
    let lista = this.listaPrecoPrivado.filter(p => !this.precosSelecionados.map(s => s.id).includes(p.id));

    lista = Utility.sortValues(lista, 'nome');

    dialogConfig.data = {
      listaPrecos: lista,
      taxaDetran: this.taxaDetran,
      resultadoPrecos: preco
    };

    const dialogRef = this.dialog.open(
      DialogPesquisaCestaComponent,
      dialogConfig
    );

    dialogRef.afterClosed().subscribe((formularioValores: any) => {
      if (!formularioValores) return;
      let dataInicio = new Date(formularioValores.dataInicioVigencia);
      let inclusao = this.cestasInclusao.filter(i => i.precoTecnobankId == preco.id);

      dataInicio.setHours(0, 0, 0);

      let selecionado = this.listaPrecoPrivado.filter(c => c.id === formularioValores.preco)[0];
      selecionado.dataInicioVigencia = dataInicio;
      selecionado.opcaoVigencia = formularioValores.periodoVigencia;

      let datasIguais = this.verificarDatasIguais(selecionado);
      if (datasIguais) {
        if (datasIguais.id !== preco.id) {
          this.mostrarModalInformativoMesmaData(datasIguais);
          return;
        }
      }

      if (inclusao.length > 0) {
        let index = this.cestasInclusao.indexOf(inclusao[0]);
        this.cestasInclusao.splice(index, 1);

        Utility.waitFor(() => {
          this.cestasInclusao.push(<EmpresaPrecoTbk>{
            precoTecnobankId: formularioValores.preco,
            notaDebito: this.formulario.value.emitirNota,
            criadoPor: PermissoesSistema.retornarNomeUsuario,
            uf: this.uf,
            empresaId: +this.empresaId,
            dataInicioVigencia: dataInicio,
            opcaoVigencia: formularioValores.opcaoVigencia
          });

          let index = this.precosSelecionados.indexOf(this.precosSelecionados.filter(p => p.id == preco.id)[0]);
          this.precosSelecionados.splice(index, 1);
          this.adicionarSelecionado(selecionado);
        }, 1000);

        return;
      }

      let empresaPrecoTecnobankId = this.precosInclusos.filter(p => p.precoTecnobankId == preco.id)[0].id;

      let editar = <EditarCesta>{
        idEditado: empresaPrecoTecnobankId,
        precoTecnobankId: formularioValores.preco,
        dataInicioVigencia: dataInicio,
        opcaoVigencia: formularioValores.periodoVigencia
      };

      let existeCestaEdicao = this.cestasEdicao.filter(e => e.idEditado == empresaPrecoTecnobankId);

      if (existeCestaEdicao.length > 0) {
        let index = this.cestasEdicao.indexOf(existeCestaEdicao[0]);
        this.cestasEdicao.splice(index, 1);
      }

      this.cestasEdicao.push(editar);

      let index = this.precosSelecionados.indexOf(this.precosSelecionados.filter(p => p.id == preco.id)[0]);
      this.precosSelecionados.splice(index, 1);

      this.adicionarSelecionado(selecionado);
    });
  }

  excluirCesta(preco: PrecoTbk) {
    let precoIncluso = this.precosInclusos.filter(p => p.precoTecnobankId == preco.id);

    if (precoIncluso.length > 0) {
      this.store.dispatch(showPreloader({ payload: '' }));

      this.empresaFaturamentoService.excluirCestaEmpresa(precoIncluso[0].id).subscribe({
        next: (response) => {
          this.store.dispatch(closePreloader());

          if (response.deletado) {
            let indexSelecionado = this.precosSelecionados.indexOf(this.precosSelecionados.filter(p => p.id == preco.id)[0]);
            this.precosSelecionados.splice(indexSelecionado, 1);

            this.obterPrecosPrivados();
            this.notifierService.showNotification('Cesta excluída da empresa com sucesso!', null, 'success');
            return;
          }
        },
        error: (response) => {
          this.store.dispatch(closePreloader());
          this.notifierService.showNotification(response.error.errors[0].message, null, 'error');
        }
      });

      return;
    }

    let index = this.cestasInclusao.indexOf(this.cestasInclusao.filter(c => c.precoTecnobankId == preco.id)[0]);
    this.cestasInclusao.splice(index, 1);
    let indexSelecionado = this.precosSelecionados.indexOf(this.precosSelecionados.filter(p => p.id == preco.id)[0]);
    this.precosSelecionados.splice(indexSelecionado, 1);
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

  private obterEmpresaPrecoTecnobank() {
    this.empresaFaturamentoService.obterEmpresaPrecoTecnobank(this.empresaId, this.uf).subscribe(response => {
      if (response.listaEmpresaPrecoTecnobank?.length > 0) {
        this.consultaPreco = true;
        this.precosSelecionados = [];
        if (response.listaEmpresaPrecoTecnobank.length > 1) { this.precoSalvoId = response.listaEmpresaPrecoTecnobank.filter(p => p.status === 'VIGENTE')[0].precoTecnobankId; }
        else { this.precoSalvoId = response.listaEmpresaPrecoTecnobank[0].precoTecnobankId; }
        this.precosInclusos = response.listaEmpresaPrecoTecnobank;
        this.obterPrecoPrivadoPorId(response.listaEmpresaPrecoTecnobank);

      }
      else {
        this.consultaPreco = false;
        this.ordenarListaPrecos();
      }

      this.store.dispatch(closePreloader());
    });
  }

  private obterPrecoPrivadoPorId(empresaPreco: EmpresaPrecoTbk[]) {
    let aux: PrecoTbk[] = [];

    empresaPreco.forEach(ep => {
      let precoTBK = this.listaPrecoPrivado.filter(c => ep.precoTecnobankId === c.id)[0];

      if (precoTBK) {
        aux.push(<PrecoTbk>{
          id: ep.precoTecnobankId,
          uf: precoTBK.uf,
          dataInicioVigencia: ep.dataInicioVigencia,
          dataTerminoVigencia: ep.dataTerminoVigencia,
          tipoPreco: precoTBK.tipoPreco,
          status: ep.status,
          criadoPor: ep.criadoPor,
          renovacaoAutomatica: precoTBK.renovacaoAutomatica,
          operacoes: precoTBK.operacoes,
          criadoEm: ep.criadoEm,
          modificadoEm: ep.modificadoEm,
          ativo: precoTBK.ativo,
          nome: precoTBK.nome
        });
      }
    });

    aux = aux.sort((b, a) => new Date(b.dataInicioVigencia).getTime() - new Date(a.dataInicioVigencia).getTime());
    this.precosSelecionados = aux;
  }

  private obterPrecosPrivados() {
    this.store.dispatch(showPreloader({ payload: '' }));
    this.precoService.obterPrecoTbkPorUf(this.uf, true, 2, true).subscribe(response => {
      this.listaPrecoPrivado = response.precoTecnobank;
      this.ordenarListaPrecos();
      this.obterEmpresaPrecoTecnobank();
    });
  }

  private ordenarListaPrecos() {
    this.listaPrecoPrivado = this.listaPrecoPrivado.sort((b, a) => new Date(b.dataInicioVigencia).getTime() - new Date(a.dataInicioVigencia).getTime());
  }

  private adicionarSelecionado(selecionado: PrecoTbk) {
    let precosAux = [];
    this.precosSelecionados.forEach(preco => { precosAux.push(preco); });

    precosAux.push(selecionado);
    precosAux = precosAux.sort((b, a) => new Date(b.dataInicioVigencia).getTime() - new Date(a.dataInicioVigencia).getTime());

    this.precosSelecionados = precosAux;
    this.possuiPrecoSelecionado.emit(true);
  }

  async onSalvar() {
    this.store.dispatch(showPreloader({ payload: '' }));

    let promises = [];

    for (let i = 0; i < this.cestasInclusao.length; i++) {
      promises.push(
        from(this.empresaFaturamentoService.criarEmpresaPrecoTecnobank(this.cestasInclusao[i]))
          .toPromise().catch(() => { return null }))
    }

    for (let i = 0; i < this.cestasEdicao.length; i++) {
      let editar = <EmpresaPrecoTbk>{
        id: this.cestasEdicao[i].idEditado,
        precoTecnobankId: this.cestasEdicao[i].precoTecnobankId,
        notaDebito: this.formulario.value.emitirNota,
        criadoPor: PermissoesSistema.retornarNomeUsuario,
        uf: this.uf,
        empresaId: +this.empresaId,
        dataInicioVigencia: this.cestasEdicao[i].dataInicioVigencia,
        opcaoVigencia: this.cestasEdicao[i].opcaoVigencia
      };

      promises.push(
        from(this.empresaFaturamentoService.editarPrecoPrivadoEmpresa(editar))
          .toPromise().catch(() => { return null }))
    }

    if (promises.length > 0) {
      await Promise.all(promises).then((response) => {
        let erro = response.filter(r => r == null)[0];

        if (erro) {
          this.notifierService.showNotification('Não foi possível salvar.', '', 'error');
          this.store.dispatch(closePreloader());
          return;
        }
      });
    }

    this.salvarNotaDebito();
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
    if (this.consultaPreco) {
      this.notifierService.showNotification('Cesta de serviço alterada com sucesso!', null, 'success');
    }
    else { this.notifierService.showNotification('Cesta de serviço cadastrada com sucesso!', null, 'success'); }

    this.fechar.emit(true);
  }

  private erro(mensagem: string) {
    this.notifierService.showNotification(mensagem, null, 'error');
  }

}
