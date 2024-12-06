import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormGroupDirective, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatLegacyDialog as MatDialog, MatLegacyDialogConfig as MatDialogConfig } from '@angular/material/legacy-dialog';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { debounceTime, pairwise } from 'rxjs/operators';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { TaxaDetran } from 'src/app/modules/sistemas/sub-modules/faturamento/core/models/taxa/taxa-detran.model';
import { PrecoService } from 'src/app/modules/sistemas/sub-modules/faturamento/services/preco.service';
import { TaxaService } from 'src/app/modules/sistemas/sub-modules/faturamento/services/taxa.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { SortByPipe } from 'src/app/shared/pipes/sort-by.pipe';
import {
  closePreloader,
  showPreloader,
} from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { SubSink } from 'subsink';
import { Dominios } from '../../../../core/models/dominios/dominios.model';
import { Detran } from '../../../../core/models/empresas/detran.model';
import { Municipio } from '../../../../core/models/geograficos/municipio.model';
import { Uf } from '../../../../core/models/geograficos/uf.model';
import { CriarEnderecoDetranEmpresaRequest } from '../../../../core/requests/empresas/criar-endereco-detran-empresa.request';
import { EnderecoResponse } from '../../../../core/responses/geograficos/endereco.response';
import { DominioService } from '../../../../services/dominio.service';
import { EmpresasService } from '../../../../services/empresas.service';
import { GeograficoService } from '../../../../services/geografico.service';
import { DialogListarEnderecosComponent } from '../dialog-listar-enderecos/dialog-listar-enderecos.component';

@Component({
  selector: 'app-configurar-produto',
  templateUrl: './configurar-produto.component.html',
  styleUrls: ['./configurar-produto.component.scss'],
})
export class ConfigurarProdutoComponent implements OnInit {
  @ViewChild(FormGroupDirective) formDirective: FormGroupDirective;
  @Output() isEditionBlock: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input('companyId') companyId: any;

  detranForm = this.formBuilder.group({
    id: null,
    uf: ['', Validators.required],
    codigoDetran: ['', Validators.required],
    codigoSng: ['', Validators.required],
    cep: [{ value: '', disabled: true }, Validators.required],
    logradouro: [{ value: '', disabled: true }, Validators.required],
    numero: [{ value: '', disabled: true }, Validators.required],
    bairro: [{ value: '', disabled: true }, Validators.required],
    complemento: [{ value: '', disabled: true }],
    cidade: [{ value: '', disabled: true }, Validators.required],
    estado: [{ value: '', disabled: true }, Validators.required],
    restricao: false,
    municipioId: [''],
    parametrizarDuda: [''],
    enderecoEmpresaId: [''],
    dataInicial: ['', Validators.required],
    dataFinal: [null],
  });

  detrans = [];
  ufsDetran: Dominios[] = [];
  ufs: Uf[] = [];
  messagePreloader: string = '';
  sortPipe = new SortByPipe();
  selectedDetran: number = null;
  listaEnderecos = { empresaId: null, enderecos: [] };

  utility = Utility;
  Permissoes = Permissoes;

  // booleans
  isEdition: boolean = false;

  consultaPrecoUf: string = null;
  consultaTipoPreco: number = null;

  // cep finders
  cep$ = new Subject<string>();
  private subscriptions = new SubSink();
  municipioCep: string = null;
  municipiosFiltrados: Municipio[] = [];
  municipios: Municipio[] = [];
  private changeCep: boolean = true;
  findingAddress: boolean = false;
  isInvalidCep: boolean = false;

  taxaDetran: TaxaDetran;
  tipoPrecos: any;

  possuiPrecoSelecionado: boolean = false;
  triggerSalvarCesta: boolean = false;
  carregarPrecos: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private formBuilder: UntypedFormBuilder,
    private store: Store<{ preloader: IPreloaderState }>,
    private dominioService: DominioService,
    private geograficoService: GeograficoService,
    private empresasService: EmpresasService,
    private notifierService: NotifierService,
    private precoService: PrecoService,
    private taxaService: TaxaService
  ) {
    if (this.activatedRoute.snapshot.params['empresaId'] != undefined) {
      this.companyId = this.activatedRoute.snapshot.params['empresaId'];
    }
  }

  hasDetran() {
    return this.detrans.length ? true : false;
  }

  isDetranFormValid() {
    if (!this.selectedDetran && this.ehPrecoPrivado()) {
      return this.detranForm.valid && this.possuiPrecoSelecionado;
    }

    return this.detranForm.valid;
  }

  hasDetranId() {
    return this.selectedDetran ? 'Salvar' : 'Adicionar';
  }

  ngOnInit(): void {
    this.carregarUfsDetran();
    this.carregarUfs();
    this.obterTiposPrecos();
    this.companyId && this.getDetranUfs();

    if (!Utility.getPermission([Permissoes.GESTAO_EMPRESA_CADASTRAR])) {
      Utility.modoConsulta(this.detranForm);
    }

    this.detranForm
      .get('cep')
      .valueChanges.pipe(debounceTime(2000))
      .subscribe((cep: string) => {
        this.cep$.next(cep);
      });

    this.detranForm
      .get('cidade')
      .valueChanges.subscribe((item: string) => this.filterData(item));

    this.detranForm.get('uf').valueChanges.pipe(pairwise()).subscribe(([prev, next]) => {
      if (prev === next) return;

      if (this.selectedDetran == null && next == 'RJ') {
        this.detranForm.get('parametrizarDuda').setValue(true);
      }

      if (next != 'RJ') {
        this.detranForm.get('parametrizarDuda').setValue(false);
      }

      this.carregarPrecos = false;

      if (!this.taxaDetran) {
        this.obterTaxaDetran(next);
      }

      if (next) {
        Utility.waitFor(() => {
          this.carregarPrecos = true;
        }, 1000)
      }
    })
  }

  ehPrecoPrivado() {
    return this.tipoPrecos?.filter(p => p.uf === this.detranForm.get('uf').value)[0]?.tipoPreco == 2;
  }

  addDetran() {
    this.companyId && this.carregarEnderecoPrincipal();
    this.toggleEdition();
    this.detranForm.get('uf').enable();
  }

  selectDetran(detran: Detran) {
    this.detranForm.reset();
    this.selectedDetran = detran.id;
    this.detranForm.get('uf').disable();

    this.empresasService
      .obterEnderecoUfDetran(this.companyId, detran.id)
      .subscribe((result) => {
        this.detranForm.setValue({
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
          enderecoEmpresaId: result.enderecoEmpresaId,
          dataInicial: Utility.formatDatePicker(result.dataInicial),
          dataFinal: Utility.formatDatePicker(result.dataFinal),
        });
      });
    this.toggleEdition();
  }

  consultarPreco(uf: string) {
    this.consultaPrecoUf = uf;
    this.consultaTipoPreco = this.retornarTipoPreco(uf);
    this.obterTaxaDetran(uf);
    this.isEditionBlock.emit(true);
  }

  sucessoCesta() {
    this.formDirective.resetForm();
    this.cancelDetran();
  }

  fecharConsultaPreco() {
    this.consultaPrecoUf = null;
    this.consultaTipoPreco = null;
    this.isEditionBlock.emit(false);
  }

  ativarInativarDetran(detran: Detran) {
    this.store.dispatch(showPreloader({ payload: '' }));

    if (detran.ativo) {
      this.empresasService
        .inativarUfDetran(this.companyId, detran.id)
        .subscribe((response) => {
          if (response.errors) {
            this.notifierService.showNotification(
              response.errors[0].message,
              response.errors[0].code,
              'error'
            );
            this.store.dispatch(closePreloader());
            return;
          }
          this.getDetranUfs();
          this.store.dispatch(closePreloader());
        });

      return;
    }

    this.empresasService
      .ativarUfDetran(this.companyId, detran.id)
      .subscribe((response) => {
        if (response.errors) {
          this.notifierService.showNotification(
            response.errors[0].message,
            response.errors[0].code,
            'error'
          );
          this.store.dispatch(closePreloader());
          return;
        }

        this.getDetranUfs();
        this.store.dispatch(closePreloader());
      });
  }

  cancelDetran() {
    this.detranForm.reset();
    this.selectedDetran = null;
    this.toggleEdition();
  }

  toggleEdition() {
    this.isEdition = !this.isEdition;
    this.isEditionBlock.emit(this.isEdition);
  }

  onSubmit() {
    this.triggerSalvarCesta = false;

    if (this.detranForm.get('id').value == null) {
      this.store.dispatch(showPreloader({ payload: this.messagePreloader }));
      this.createDetranAddress();
    } else {
      this.updateDetranAddress();
    }
  }

  createDetranAddress() {
    this.empresasService
      .criarEnderecoDetran(this.companyId, <CriarEnderecoDetranEmpresaRequest>{
        ufDetran: this.detranForm.get('uf').value,
        codigoDetran: this.detranForm.get('codigoDetran').value,
        codigoSng: this.detranForm.get('codigoSng').value,
        restricaoAdministrativa: this.detranForm.get('restricao').value == true,
        municipioId: this.detranForm.get('municipioId').value,
        parametrizarDuda: this.detranForm.get('parametrizarDuda').value,
        enderecoEmpresaId: this.detranForm.get('enderecoEmpresaId').value,
        dataInicial: Utility.formatDate(
          this.detranForm.get('dataInicial').value
        ),
        dataFinal: this.detranForm.get('dataFinal').value
          ? Utility.formatDate(this.detranForm.get('dataFinal').value)
          : null,
      })
      .subscribe(
        (result) => {
          if (result.detranId) {
            this.getDetranUfs();
            this.store.dispatch(closePreloader());
            this.notifierService.showNotification(
              'UF cadastrada.',
              'Sucesso',
              'success'
            );

            this.detranForm.get('id').patchValue(result.detranId);

            if (this.ehPrecoPrivado()) {
              this.detranForm.get('uf').disable();
              this.triggerSalvarCesta = true;
            }
            else {
              this.formDirective.resetForm();
              this.cancelDetran();
            }

            return;
          }
          this.store.dispatch(closePreloader());
          this.notifierService.showNotification(
            result.errors[0].message,
            result.errors[0].code,
            'error'
          );
        },
        (error) => this.store.dispatch(closePreloader())
      );
  }

  updateDetranAddress() {
    this.empresasService
      .atualizarEnderecoUfDetran(
        this.companyId,
        this.detranForm.get('id').value,
        <CriarEnderecoDetranEmpresaRequest>{
          ufDetran: this.detranForm.get('uf').value,
          codigoDetran: this.detranForm.get('codigoDetran').value,
          codigoSng: this.detranForm.get('codigoSng').value,
          restricaoAdministrativa:
            this.detranForm.get('restricao').value == true,
          municipioId: this.detranForm.get('municipioId').value,
          parametrizarDuda: this.detranForm.get('parametrizarDuda').value,
          enderecoEmpresaId: this.detranForm.get('enderecoEmpresaId').value,
          dataInicial: Utility.formatDate(
            this.detranForm.get('dataInicial').value
          ),
          dataFinal: this.detranForm.get('dataFinal').value
            ? Utility.formatDate(this.detranForm.get('dataFinal').value)
            : null,
        }
      )
      .subscribe(
        (result) => {
          this.store.dispatch(
            showPreloader({ payload: this.messagePreloader })
          );
          if (!result.errors) {
            this.getDetranUfs();
            this.notifierService.showNotification(
              'UF atualizada.',
              'Sucesso',
              'success'
            );

            if (!this.selectedDetran && this.ehPrecoPrivado()) {
              this.triggerSalvarCesta = true;
            }
            else {
              this.cancelDetran();
            }

            this.store.dispatch(closePreloader());
            return;
          }

          this.notifierService.showNotification(
            result.errors[0].message,
            result.errors[0].code,
            'error'
          );
          this.store.dispatch(closePreloader());
        },
        (error) => this.store.dispatch(closePreloader())
      );
    // this.cancelDetran();
  }

  getDetranUfs() {
    this.empresasService
      .obterUfsProdutoEmpresa(this.companyId)
      .subscribe((result) => {
        if (result?.detrans?.length > 0) {
          result.detrans.sort((a, b) => {
            return (a.ativo ? 0 : 1) - (b.ativo ? 0 : 1);
          });
          this.detrans = this.sortPipe.transform(
            result.detrans.filter((d) => d.ativo),
            'asc',
            'ufDetran'
          );
          this.detrans.push(
            ...this.sortPipe.transform(
              result.detrans.filter((d) => !d.ativo),
              'asc',
              'ufDetran'
            )
          );
        }
      });
  }

  carregarEnderecoPrincipal() {
    this.store.dispatch(showPreloader({ payload: this.messagePreloader }));
    this.empresasService
      .obterEmpresasEnderecoPrincipal(this.companyId)
      .subscribe((enderecoPrincipal) => {
        if (enderecoPrincipal?.endereco) {
          this.detranForm.setValue({
            id: null,
            uf: this.detranForm.get('uf').value,
            codigoDetran: this.detranForm.get('codigoDetran').value,
            codigoSng: this.detranForm.get('codigoSng').value,
            cep: enderecoPrincipal.endereco.cep,
            logradouro: enderecoPrincipal.endereco.logradouro,
            numero: enderecoPrincipal.endereco.numero,
            bairro: enderecoPrincipal.endereco.bairro,
            complemento: enderecoPrincipal.endereco.complemento,
            cidade: enderecoPrincipal.endereco.municipio,
            estado: enderecoPrincipal.endereco.uf,
            restricao: false,
            municipioId: enderecoPrincipal.endereco.municipioId,
            parametrizarDuda: this.detranForm.get('parametrizarDuda').value,
            enderecoEmpresaId: enderecoPrincipal.id,
            dataInicial: this.detranForm.get('dataInicial').value,
            dataFinal: this.detranForm.get('dataFinal').value,
          });
        }
      });
    this.store.dispatch(closePreloader());
  }

  carregarDadosEnderecos() {
    this.empresasService
      .obterEmpresasEndereco(this.companyId)
      .subscribe((result) => {
        this.listaEnderecos.empresaId = this.companyId;
        this.listaEnderecos.enderecos = result.enderecos;
        this.listaEnderecos.enderecos.sort((a, b) => {
          return (a.enderecoPrincipal ? 0 : 1) - (b.enderecoPrincipal ? 0 : 1);
        });
        this.openEnderecoDialog();
      });
  }

  openEnderecoDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      listaEnderecos: this.listaEnderecos,
      empresaId: this.companyId,
    };

    const dialogRef = this.dialog.open(
      DialogListarEnderecosComponent,
      dialogConfig
    );

    dialogRef.afterClosed().subscribe((enderecoSelecionado) => {
      if (enderecoSelecionado) {
        this.detranForm.setValue({
          id: this.detranForm.get('id').value,
          uf: this.detranForm.get('uf').value,
          codigoDetran: this.detranForm.get('codigoDetran').value,
          codigoSng: this.detranForm.get('codigoSng').value,
          cep: enderecoSelecionado.endereco.cep,
          logradouro: enderecoSelecionado.endereco.logradouro,
          numero: enderecoSelecionado.endereco.numero,
          bairro: enderecoSelecionado.endereco.bairro,
          complemento: enderecoSelecionado.endereco.complemento,
          cidade: enderecoSelecionado.endereco.municipio,
          estado: enderecoSelecionado.endereco.uf,
          restricao: false,
          municipioId: enderecoSelecionado.endereco.municipioId,
          parametrizarDuda: this.detranForm.get('parametrizarDuda').value,
          enderecoEmpresaId: enderecoSelecionado.id,
          dataInicial: this.detranForm.get('dataInicial').value,
          dataFinal: this.detranForm.get('dataFinal').value
        });
      }
    });
  }

  // utility
  obterEnderecoPorCep(cep: string) {
    this.municipioCep = null;
    if (cep == undefined) return;

    this.findingAddress = true;

    this.geograficoService
      .obterEnderecoPorCep(cep)
      .subscribe((endereco: EnderecoResponse) => {
        if (endereco.isSuccessful) {
          this.detranForm
            .get('logradouro')
            .setValue(endereco.endereco.logradouro);
          this.detranForm.get('bairro').setValue(endereco.endereco.bairro);
          this.detranForm.get('estado').setValue(endereco.endereco.uf);
          Utility.waitFor(() => {
            this.detranForm
              .get('cidade')
              .setValue(endereco.endereco.localidade);
            this.detranForm
              .get('municipioId')
              .setValue(this.municipiosFiltrados[0]?.id);
          }, 3000);
          this.findingAddress = false;
          this.isInvalidCep = false;
          return;
        }

        this.findingAddress = false;
        this.isInvalidCep = true;
      });
  }

  private filterData(value: string) {
    if (value != undefined) {
      const valueInput = value.toLocaleLowerCase();
      this.municipiosFiltrados = this.municipios?.filter((item: Municipio) => {
        return item.nome.toLowerCase().indexOf(valueInput) > -1;
      });
    }
  }

  // load dropdowns
  carregarUfsDetran() {
    this.dominioService.obterPorTipo('UF_DETRAN').subscribe((result) => {
      this.ufsDetran = result.valorDominio;
    });
  }

  private carregarUfs() {
    this.geograficoService.obterUfs().subscribe((result) => {
      this.ufs = result.ufs;
    });
  }

  private obterTiposPrecos() {
    this.store.dispatch(showPreloader({ payload: '' }));
    this.precoService.obterPrecosVigentes().subscribe(response => {
      if (response.precoTecnobank) {
        this.tipoPrecos = [];

        response.precoTecnobank.forEach(p => {
          this.tipoPrecos.push({
            uf: p.uf,
            tipoPreco: p.tipoPreco
          })
        })
      }

      this.store.dispatch(closePreloader());
    })
  }

  retornarTipoPreco(uf: string) {
    return this.tipoPrecos?.filter(t => t.uf === uf)[0]?.tipoPreco;
  }

  private obterTaxaDetran(uf: string) {
    this.taxaService.obterTaxasDetranPorUf(uf).subscribe(response => {
      if (response.taxasDetran) {
        let taxaDetran = response.taxasDetran.sort((b, a) => new Date(b.dataInicioVigencia).getTime() - new Date(a.dataInicioVigencia).getTime());
        this.taxaDetran = taxaDetran[0];
      }
    });
  }
}
