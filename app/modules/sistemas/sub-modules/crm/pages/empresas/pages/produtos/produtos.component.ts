import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, FormControl, Validators } from '@angular/forms';
import { MatLegacyDialog as MatDialog, MatLegacyDialogConfig as MatDialogConfig } from '@angular/material/legacy-dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { DialogCommonComponent } from 'src/app/shared/components/dialog-common/dialog-common.component';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { Produtos } from '../../../../core/models/produtos/produtos.model';
import { CriarEnderecoDetranEmpresaRequest } from '../../../../core/requests/empresas/criar-endereco-detran-empresa.request';
import { EmpresasService } from '../../../../services/empresas.service';
import { ProdutosService } from '../../../../services/produtos.service';
import { DialogListarEnderecosComponent } from '../../components/dialog-listar-enderecos/dialog-listar-enderecos.component';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { DominioService } from '../../../../services/dominio.service';
import { Dominios } from '../../../../core/models/dominios/dominios.model';
import { GeograficoService } from '../../../../services/geografico.service';
import { EnderecoResponse } from '../../../../core/responses/geograficos/endereco.response';

import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SortByPipe } from 'src/app/shared/pipes/sort-by.pipe';
import { Municipio } from '../../../../core/models/geograficos/municipio.model';
import { MunicipioResponse } from '../../../../core/responses/geograficos/municipio.response';
import { Utility } from 'src/app/core/common/utility';
import { Uf } from '../../../../core/models/geograficos/uf.model';
import { Detran } from '../../../../core/models/empresas/detran.model';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { AtualizarVersaoLotesRequest } from '../../../../core/requests/empresas/atualizar-versao-lotes.request';
import { MatLegacyOption as MatOption } from '@angular/material/legacy-core';
import { Permissoes } from 'src/app/core/common/permissoes';

@Component({
  selector: 'app-produtos',
  templateUrl: './produtos.component.html',
  styleUrls: ['./produtos.component.scss'],
})
export class ProdutosComponent implements OnInit {

  utility = Utility;
  Permissoes = Permissoes;

  step: number = 1;
  viewDetran: boolean = false;
  selectedDetran: number = null;
  empresaId: number;
  produtoId: number = null;
  childstate: boolean = false;
  produtos: Produtos[];
  produtoSelecionado: Produtos = null;
  detrans: Detran[] = [];
  listaEnderecos = { empresaId: null, enderecos: [] };
  messagePreloader: string = '';
  ufsDetran: Dominios[] = [];
  loading: boolean = false;
  cep$ = new Subject<string>();
  cepInvalido: boolean = false;
  municipiosFiltrados: Municipio[] = [];
  municipios: Municipio[] = [];
  ufs: Uf[] = [];

  configLotesForm = this.formBuilder.group({
    tipoLote: [[]],
  });

  dadosUfForm = this.formBuilder.group({
    id: null,
    uf: ['', Validators.required],
    codigoDetran: ['', Validators.required],
    codigoSng: '',
    cep: [{ value: "", disabled: true }, Validators.required],
    logradouro: [{ value: "", disabled: true }, Validators.required],
    numero: [{ value: "", disabled: true }, Validators.required],
    bairro: [{ value: "", disabled: true }, Validators.required],
    complemento: [{ value: "", disabled: true }],
    cidade: [{ value: "", disabled: true }, Validators.required],
    estado: [{ value: "", disabled: true }, Validators.required],
    restricao: false,
    municipioId: [''],
    parametrizarDuda: [''],
    enderecoEmpresaId: ['']
  });

  versoesLote: Dominios[] = [];

  produtosForm = this.formBuilder.group({});
  dadosLotesOpen: boolean = true;

  sortPipe = new SortByPipe();

  @ViewChild('allSelectedOptions') private allSelectedOptions: MatOption;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private produtosService: ProdutosService,
    private empresasService: EmpresasService,
    private notifierService: NotifierService,
    private store: Store<{ preloader: IPreloaderState }>,
    private dominioService: DominioService,
    private geograficoService: GeograficoService
  ) {
    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd;
      if (navEnd) {
        this.empresaId = +val['url'].split('atualizar-empresa')[1]?.split('/')[1]
        this.childstate = val['url'].split('atualizar-empresa')[1]?.includes('usuario-master');
      }
    });
  }

  ngOnInit(): void {
    this.produtosService.obterProdutos().subscribe(result => {
      this.produtos = result.produtos;
      this.produtos.forEach(produto => {
        this.produtosForm.addControl('produto_' + produto.id, new FormControl());
      });

      this.produtosForm.controls['produto_' + this.produtos[0].id].setValue(true);
    })

    this.carregarUfsDetran();

    this.dadosUfForm.get('cep').valueChanges
      .pipe(debounceTime(2000))
      .subscribe((cep: string) => this.cep$.next(cep))

    this.carregarVersoesLote();
    this.carregarUfs();

    this.dadosUfForm.get('cidade').valueChanges
      .subscribe((item: string) => this.filterData(item));

    this.dadosUfForm.get('uf').valueChanges.subscribe(detran => {
      if (this.selectedDetran == null && detran == "RJ") {
        this.dadosUfForm.get('parametrizarDuda').setValue(true);
      }

      if (detran != "RJ") { this.dadosUfForm.get('parametrizarDuda').setValue(false); }
    })

    if (!Utility.getPermission([Permissoes.GESTAO_EMPRESA_CADASTRAR])) {
      Utility.modoConsulta(this.produtosForm);
      Utility.modoConsulta(this.dadosUfForm);
    }
  }

  carregarLoteEmpresa(empresaId: number) {
    this.empresasService.obterEmpresa(empresaId).subscribe(response => {
      if (response.versoesLote.length > 0) {
        if (this.versoesLote.length == response.versoesLote.length) {
          this.allSelectedOptions.select();
          this.toggleAllSelection();
        }
        else { this.configLotesForm.get('tipoLote').patchValue(response.versoesLote.map(v => v.dominioId)); }
      }
    })
  }

  carregarVersoesLote() {
    this.dominioService.obterPorTipo('VERSOES_LOTE').subscribe(response => {
      this.versoesLote = response.valorDominio;
      this.carregarLoteEmpresa(this.empresaId);
    });
  }

  associarProdutoEmpresa() {
    let produtoId = null;

    Object.keys(this.produtosForm.controls).forEach(key => {
      if (this.produtosForm.get(key).value) { produtoId = key.split('_')[1]; }
    });

    if (produtoId != null) {
      this.produtoId = produtoId;
      this.produtoSelecionado = this.produtos.filter(produto => produto.id == produtoId)[0];
      this.empresasService.associarProdutoEmpresa(this.empresaId, produtoId).toPromise()
        .then(result => {
          this.getDetranUfs();
          this.goToStep(2);
        })
        .catch(() => {
          this.getDetranUfs();
          this.goToStep(2)
        });
      //TRATAR para quando der erro
    }
  }

  selectDetran(detran: Detran) {
    this.dadosUfForm.reset();
    this.viewDetran = true;
    this.dadosLotesOpen = false;
    this.selectedDetran = detran.id;
    this.dadosUfForm.get('uf').disable();

    this.empresasService.obterEnderecoUfDetran(this.empresaId, detran.id).subscribe(result => {
      this.dadosUfForm.setValue({
        id: detran.id,
        uf: detran.ufDetran,
        codigoDetran: detran.codigoDetran,
        codigoSng: detran.codigoSng,
        cep: result.cep,
        logradouro: result.logradouro,
        numero: result.numero,
        bairro: result.bairro,
        complemento: result.complemento,
        cidade: result.municipio,
        estado: result.uf,
        restricao: detran.restricaoAdministrativa,
        municipioId: result.municipioId,
        parametrizarDuda: result?.parametrizarDuda ?? false,
        enderecoEmpresaId: result.enderecoEmpresaId
      })
    })
  }

  addDetran() {
    this.dadosUfForm.reset();
    this.selectedDetran = null;
    this.dadosUfForm.get('uf').enable();
    this.getEnderecoPrincipal();
  }

  goToStep(step) {
    this.step = step;
  }

  carregarDadosEnderecos() {
    this.empresasService.obterEmpresasEndereco(this.empresaId).subscribe(result => {
      this.listaEnderecos.empresaId = this.empresaId;
      this.listaEnderecos.enderecos = result.enderecos;
      this.listaEnderecos.enderecos.sort((a, b) => { return (a.enderecoPrincipal ? 0 : 1) - (b.enderecoPrincipal ? 0 : 1) });
      this.openEnderecoDialog();
    });
  }

  openEnderecoDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = { listaEnderecos: this.listaEnderecos, empresaId: this.empresaId };

    const dialogRef = this.dialog.open(DialogListarEnderecosComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(enderecoSelecionado => {
      if (enderecoSelecionado) {
        this.dadosUfForm.setValue({
          id: this.dadosUfForm.get('id').value,
          uf: this.dadosUfForm.get('uf').value,
          codigoDetran: this.dadosUfForm.get('codigoDetran').value,
          codigoSng: this.dadosUfForm.get('codigoSng').value,
          cep: enderecoSelecionado.endereco.cep,
          logradouro: enderecoSelecionado.endereco.logradouro,
          numero: enderecoSelecionado.endereco.numero,
          bairro: enderecoSelecionado.endereco.bairro,
          complemento: enderecoSelecionado.endereco.complemento,
          cidade: enderecoSelecionado.endereco.municipio,
          estado: enderecoSelecionado.endereco.uf,
          restricao: false,
          municipioId: enderecoSelecionado.endereco.municipioId,
          parametrizarDuda: this.dadosUfForm.get('parametrizarDuda').value,
          enderecoEmpresaId: enderecoSelecionado.id
        })
      }
    });
  }

  getDetranUfs() {
    this.empresasService.obterUfsProdutoEmpresa(this.empresaId).subscribe(result => {
      if (result?.detrans?.length > 0) {
        result.detrans.sort((a, b) => { return (a.ativo ? 0 : 1) - (b.ativo ? 0 : 1) });
        this.detrans = this.sortPipe.transform(result.detrans.filter(d => d.ativo), 'asc', 'ufDetran');
        this.detrans.push(...this.sortPipe.transform(result.detrans.filter(d => !d.ativo), 'asc', 'ufDetran'))
      }
    });
  }

  getEnderecoPrincipal() {
    this.empresasService.obterEmpresasEnderecoPrincipal(this.empresaId).subscribe(result => {
      if (result.errors) {
        this.viewDetran = true;
        this.dadosLotesOpen = false;
        return;
      }
      const dialogRef = this.dialog.open(DialogCommonComponent, {
        data: {
          title: 'Usamos o endereço principal que você criou anteriormente para preencher esta etapa.',
          text: 'Você poderá alterá-lo a qualquer momento clicando em "Alterar endereço".',
          buttonCancel: {
            value: false,
            text: '',
          },
          buttonConfirm: {
            value: true,
            text: 'Ok'
          }
        }
      })

      dialogRef.afterClosed().subscribe(confirmacao => {
        if (confirmacao) {
          this.dadosUfForm.setValue({
            id: null,
            uf: this.dadosUfForm.get('uf').value,
            codigoDetran: this.dadosUfForm.get('codigoDetran').value,
            codigoSng: this.dadosUfForm.get('codigoSng').value,
            cep: result.endereco.cep,
            logradouro: result.endereco.logradouro,
            numero: result.endereco.numero,
            bairro: result.endereco.bairro,
            complemento: result.endereco.complemento,
            cidade: result.endereco.municipio,
            estado: result.endereco.uf,
            restricao: false,
            municipioId: result.endereco.municipioId,
            parametrizarDuda: this.dadosUfForm.get('parametrizarDuda').value,
            enderecoEmpresaId: result.id
          })
          this.dadosLotesOpen = false;
          this.viewDetran = true;
        }
      })
    })
  }

  submitUfDetran() {
    if (this.dadosUfForm.get('id').value == null) {
      this.store.dispatch(showPreloader({ payload: this.messagePreloader }))
      this.empresasService.criarEnderecoDetran(this.empresaId,
        <CriarEnderecoDetranEmpresaRequest>{
          ufDetran: this.dadosUfForm.get('uf').value,
          codigoDetran: this.dadosUfForm.get('codigoDetran').value,
          codigoSng: this.dadosUfForm.get('codigoSng').value,
          restricaoAdministrativa: this.dadosUfForm.get('restricao').value == true,
          municipioId: this.dadosUfForm.get('municipioId').value,
          parametrizarDuda: this.dadosUfForm.get('parametrizarDuda').value,
          enderecoEmpresaId: this.dadosUfForm.get('enderecoEmpresaId').value
        }).subscribe(
          result => {
            if (!result.errors) {
              this.getDetranUfs();
              this.store.dispatch(closePreloader())
              this.notifierService.showNotification('UF cadastrada.', 'Sucesso', 'success');
              this.viewDetran = false;
              return;
            }
            this.store.dispatch(closePreloader())
            this.notifierService.showNotification(result.errors[0].message, result.errors[0].code, 'error');
          },
          error => this.store.dispatch(closePreloader())
        )

      return;
    }

    this.empresasService.atualizarEnderecoUfDetran(this.empresaId, this.dadosUfForm.get('id').value,
      <CriarEnderecoDetranEmpresaRequest>{
        ufDetran: this.dadosUfForm.get('uf').value,
        codigoDetran: this.dadosUfForm.get('codigoDetran').value,
        codigoSng: this.dadosUfForm.get('codigoSng').value,
        restricaoAdministrativa: this.dadosUfForm.get('restricao').value == true,
        municipioId: this.dadosUfForm.get('municipioId').value,
        parametrizarDuda: this.dadosUfForm.get('parametrizarDuda').value,
        enderecoEmpresaId: this.dadosUfForm.get('enderecoEmpresaId').value
      }).subscribe(
        result => {
          this.store.dispatch(showPreloader({ payload: this.messagePreloader }))
          if (!result.errors) {
            this.getDetranUfs();
            this.notifierService.showNotification('UF atualizada.', 'Sucesso', 'success');
            this.store.dispatch(closePreloader())
            this.viewDetran = false;
            return;
          }

          this.notifierService.showNotification(result.errors[0].message, result.errors[0].code, 'error');
          this.store.dispatch(closePreloader())
        },
        error => this.store.dispatch(closePreloader())
      )
  }

  carregarUfsDetran() {
    this.dominioService.obterPorTipo('UF_DETRAN').subscribe(result => {
      this.ufsDetran = result.valorDominio;
    });
  }

  concluir() {
    this.router.navigate([`../../../`], { relativeTo: this.activatedRoute })
  }

  voltar() {
    this.router.navigate([`../../`, this.empresaId], { relativeTo: this.activatedRoute });
  }

  obterEnderecoPorCep(cep: string) {
    if (cep == undefined) return
    this.loading = true

    this.geograficoService.obterEnderecoPorCep(cep)
      .subscribe((endereco: EnderecoResponse) => {
        if (endereco.isSuccessful) {
          this.dadosUfForm.get('logradouro').setValue(endereco.endereco.logradouro);
          this.dadosUfForm.get('bairro').setValue(endereco.endereco.bairro);
          this.dadosUfForm.get('estado').setValue(endereco.endereco.uf);
          Utility.waitFor(() => {
            this.dadosUfForm.get('cidade').setValue(endereco.endereco.localidade);
            this.dadosUfForm.get('municipioId').setValue(this.municipiosFiltrados[0]?.id);
          }, 3000);
          this.loading = false;
          this.cepInvalido = false
          return;
        }

        this.loading = false
        this.cepInvalido = true
      })
  }

  ativarInativarDetran(detran: Detran) {
    this.store.dispatch(showPreloader({ payload: '' }));

    if (detran.ativo) {
      this.empresasService.inativarUfDetran(this.empresaId, detran.id).subscribe(response => {
        if (response.errors) {
          this.notifierService.showNotification(response.errors[0].message, response.errors[0].code, 'error');
          this.store.dispatch(closePreloader())
          return;
        }

        this.getDetranUfs();
        if (this.viewDetran) this.viewDetran = false;
        this.store.dispatch(closePreloader())
      });

      return;
    }

    this.empresasService.ativarUfDetran(this.empresaId, detran.id).subscribe(response => {
      if (response.errors) {
        this.notifierService.showNotification(response.errors[0].message, response.errors[0].code, 'error');
        this.store.dispatch(closePreloader())
        return;
      }

      this.getDetranUfs();
      if (this.viewDetran) this.viewDetran = false;
      this.store.dispatch(closePreloader())
    });
  }

  validaCidade(cidade: string) {
    if (Utility.isNullOrEmpty(cidade)) return;

    const valueInput = cidade.toLowerCase();
    let existe = false;
    this.municipiosFiltrados = this.municipios.filter((item: Municipio) => {
      if (item.nome.toLowerCase() == valueInput) {
        existe = true;
        this.dadosUfForm.get('municipioId').setValue(item.id);
      }
    })
    return existe;
  }

  confirmarLotes() {
    var request = <AtualizarVersaoLotesRequest>{ versoesLoteUtilizado: this.configLotesForm.get('tipoLote').value.filter(lote => lote != 'todos') };

    this.empresasService.atualizarVersoesLote(this.empresaId, request).subscribe(response => {
      if (response.empresaId) {
        this.notifierService.showNotification('Versões atualizadas com sucesso.', '', 'success');
        this.dadosLotesOpen = false;
        return;
      }

      this.notifierService.showNotification(response.errors[0].message, '', 'error');
    });
  }

  togglePerOne() {
    if (this.allSelectedOptions.selected) {
      this.allSelectedOptions.deselect();
      return false;
    }
    if (this.configLotesForm.controls.tipoLote.value.length == this.versoesLote.length)
      this.allSelectedOptions.select();
  }

  toggleAllSelection() {
    if (this.allSelectedOptions.selected) {
      this.configLotesForm.controls.tipoLote
        .patchValue([...this.versoesLote.map(item => item.id), 'todos']);
    } else {
      this.configLotesForm.controls.tipoLote.patchValue([]);
    }
  }

  openLotesDados() {
    this.dadosLotesOpen = true;
    this.viewDetran = false;
  }

  public getElementId(tipoElemento: TipoElemento, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(tipoElemento, nomeElemento, guidElemento);
  }

  private filtrarMunicipio(uf: string) {
    if (uf != undefined) {
      this.geograficoService.obterMunicipiosPorUf(uf)
        .subscribe((municipios: MunicipioResponse) => {
          this.municipios = municipios.municipios;
        })
    }
  }

  private filterData(value: string) {
    if (value != undefined) {
      const valueInput = value.toLocaleLowerCase()
      this.municipiosFiltrados = this.municipios?.filter((item: Municipio) => {
        return item.nome.toLowerCase().indexOf(valueInput) > -1
      })
    }
  }

  private carregarUfs() {
    this.geograficoService.obterUfs().subscribe(result => { this.ufs = result.ufs; })
  }
}
