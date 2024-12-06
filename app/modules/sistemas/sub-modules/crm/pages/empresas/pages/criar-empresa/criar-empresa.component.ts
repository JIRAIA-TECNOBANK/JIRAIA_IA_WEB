import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { Utility } from 'src/app/core/common/utility';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { Dominios } from '../../../../core/models/dominios/dominios.model';
import { GruposEconomicos } from '../../../../core/models/grupos-economicos/grupos-economicos.model';
import { SubmitEmpresasRequest } from '../../../../core/requests/empresas/criar-empresa.request';
import { EnderecosResponse } from '../../../../core/responses/empresas/obter-enderecos.response';
import { DominioService } from '../../../../services/dominio.service';
import { EmpresasService } from '../../../../services/empresas.service';
import { GruposEconomicosService } from '../../../../services/grupos-economicos.service';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';

import { Store } from '@ngrx/store';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { Permissoes } from 'src/app/core/common/permissoes';

@Component({
  selector: 'app-criar-empresa',
  templateUrl: './criar-empresa.component.html',
  styleUrls: ['./criar-empresa.component.scss'],
})
export class CriarEmpresaComponent implements OnInit {

  utility = Utility;
  Permissoes = Permissoes;

  dadosOpen: boolean = true;
  enderecoOpen: boolean = false;
  listarOpen: boolean = false;
  uploadOpen: boolean = false;
  childstate: boolean = false;
  ieIsento: boolean = false;

  tiposEmpresa: Dominios[];
  responsavelComercial: Dominios[];
  gruposEconomicos: GruposEconomicos[];
  grupoEconomicoId: number = null;
  empresaId: number;

  listaEnderecos: EnderecosResponse[] = [];
  enderecoToEdit: EnderecosResponse = null;
  messagePreloader: string = '';

  fileListLength: number = 0;

  createEmpresaForm = this.formBuilder.group({
    id: null,
    cnpj: ['', Validators.compose([Validators.required, Utility.isValidCnpj()])],
    razaoSocial: '',
    nomeFantasia: '',
    ieIsento: false,
    inscricaoEstadual: ['', Validators.maxLength(9)],
    inscricaoMunicipal: ['', Validators.maxLength(11)],
    grupoEconomico: [{ value: null, disabled: true }],
    grupoEconomicoId: null,
    tipoEmpresa: '',
    comercialResponsavel: '',
    email: '',
    telefone: '',
    criarGrupoEconomico: false
  });

  criacaoEmpresa: boolean = true;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dominioService: DominioService,
    private gruposEconomicosService: GruposEconomicosService,
    private empresasService: EmpresasService,
    private notifierService: NotifierService,
    private store: Store<{ preloader: IPreloaderState }>
  ) {
    this.empresaId = this.activatedRoute.snapshot.params['empresaId'];
    this.grupoEconomicoId = this.activatedRoute.parent.params['_value']['grupoEconomicoId'];

    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd;
      if (navEnd) {
        this.childstate = val['url'].split('atualizar-empresa')[1]?.includes('produtos');

        this.criacaoEmpresa = val['url']?.includes('criar-empresa');

        if (this.empresaId) {
          this.carregarDadosEnderecos(this.empresaId);
        }
      }
    });
  }

  ngOnInit(): void {
    this.carregarTipoEmpresa();
    this.carregarResponsavelComercial();

    if (this.empresaId) { this.carregaDadosEmpresa(this.empresaId); }

    if (!Utility.getPermission([Permissoes.GESTAO_EMPRESA_CADASTRAR])) {
      Utility.modoConsulta(this.createEmpresaForm);
    }
  }

  ngAfterViewInit() {
    if (this.grupoEconomicoId) { this.carregarGrupoEconomico(); }
  }

  openDados() {
    this.dadosOpen = true;
    this.enderecoOpen = false;
    this.listarOpen = false;

    if (this.createEmpresaForm.get('id').value != null) {
      this.createEmpresaForm.get('cnpj').disable();
    }
  }

  submitEmpresa() {
    let empresa = <SubmitEmpresasRequest>{
      id: this.createEmpresaForm.get('id').value,
      nomeFantasia: this.createEmpresaForm.get('nomeFantasia').value,
      cnpj: this.createEmpresaForm.get('cnpj').value,
      razaoSocial: this.createEmpresaForm.get('razaoSocial').value,
      inscricaoEstadual: this.createEmpresaForm.get('inscricaoEstadual').value,
      inscricaoMunicipal: this.createEmpresaForm.get('inscricaoMunicipal').value,
      tipoEmpresaId: this.createEmpresaForm.get('tipoEmpresa').value,
      comercialResponsavelId: this.createEmpresaForm.get('comercialResponsavel').value,
      ativo: true,
      grupoEconomicoId: this.createEmpresaForm.get('grupoEconomicoId').value ?? 0,
      email: this.createEmpresaForm.get('email').value,
      telefone: this.createEmpresaForm.get('telefone').value,
      criarGrupoEconomico: this.grupoEconomicoId == null
    };

    if (this.createEmpresaForm.get('id').value == null) {
      this.store.dispatch(showPreloader({ payload: this.messagePreloader }))
      this.empresasService.criarEmpresa(empresa).subscribe(result => {
        if (result.empresaId) {
          this.empresaId = result.empresaId;
          this.createEmpresaForm.get('id').setValue(this.empresaId);
          this.notifierService.showNotification('Empresa criada.', 'Sucesso', 'success');
          this.closeDados();
          this.store.dispatch(closePreloader())
        }
      });

      return;
    }

    if (this.empresaId) {
      this.store.dispatch(showPreloader({ payload: this.messagePreloader }))
      this.empresasService.atualizarEmpresa(this.empresaId, empresa).subscribe(
        result => {
          if (result.empresaId) {
            this.notifierService.showNotification('Empresa editada.', 'Sucesso', 'success');
            this.closeDados();
            this.store.dispatch(closePreloader())
          }
          this.store.dispatch(closePreloader())
        },
        error => this.store.dispatch(closePreloader())
      );
    }
  }

  closeDados() {
    this.dadosOpen = false;
    if (this.listaEnderecos.length == 0) {
      this.enderecoOpen = true;
      this.listarOpen = false;
      this.uploadOpen = false;
    } else {
      this.enderecoOpen = false;
      this.listarOpen = true;
      this.uploadOpen = false;
    }
  }

  openEndereco(type) {
    this.enderecoOpen = true;
    this.dadosOpen = false;
    this.listarOpen = false;
    this.uploadOpen = false;

    if (type == 'create') {
      this.enderecoToEdit = null;
    }
  }

  openUpload() {
    this.enderecoOpen = false;
    this.dadosOpen = false;
    this.listarOpen = false;
    this.uploadOpen = true;
  }

  submitEndereco() {
    this.carregarDadosEnderecos(this.empresaId);
    this.enderecoOpen = false;
    this.listarOpen = true;
  }

  concluir() {
    if (this.criacaoEmpresa) {
      this.router.navigate([`../atualizar-empresa/${this.empresaId}/produtos`], { relativeTo: this.activatedRoute });
      return;
    }

    this.router.navigate([`../../atualizar-empresa/${this.empresaId}/produtos`], { relativeTo: this.activatedRoute });
  }

  carregaDadosEmpresa(empresaId: number) {
    if (empresaId == null) {
      this.createEmpresaForm.reset();
      this.listaEnderecos = [];
      return;
    }

    this.createEmpresaForm.get('cnpj').disable();
    this.store.dispatch(showPreloader({ payload: this.messagePreloader }))
    this.empresasService.obterEmpresa(empresaId).subscribe(
      result => {
        this.createEmpresaForm.patchValue({
          id: result.id,
          cnpj: result.cnpj,
          razaoSocial: result.razaoSocial,
          nomeFantasia: result.nomeFantasia,
          inscricaoEstadual: result.inscricaoEstadual,
          inscricaoMunicipal: result.inscricaoMunicipal,
          grupoEconomico: result.grupoEconomico.nome,
          grupoEconomicoId: result.grupoEconomico.id,
          tipoEmpresa: result.tipoEmpresaId,
          comercialResponsavel: result.comercialResponsavelId,
          email: result.email,
          telefone: result.telefone,
          criarGrupoEconomico: false
        });

        if (result.inscricaoEstadual == "ISENTO") {
          this.createEmpresaForm.get('ieIsento').patchValue(true);
          this.createEmpresaForm.get('inscricaoEstadual').disable();
        }
        this.store.dispatch(closePreloader())
      },
      error => this.store.dispatch(closePreloader())
    )

    this.carregarDadosEnderecos(empresaId);
    if (this.listaEnderecos.length > 0) { this.enderecoOpen = false; }
  }

  carregarDadosEnderecos(empresaId: number) {
    this.empresasService.obterEmpresasEndereco(empresaId).subscribe(result => {
      this.listaEnderecos = result.enderecos;
      this.listaEnderecos.sort((a, b) => { return (a.enderecoPrincipal ? 0 : 1) - (b.enderecoPrincipal ? 0 : 1) });
    });
  }

  carregarTipoEmpresa() {
    this.dominioService.obterPorTipo('TIPO_EMPRESA').subscribe(result => {
      this.tiposEmpresa = result.valorDominio;
    });
  }

  carregarResponsavelComercial() {
    this.dominioService.obterPorTipo('RESPONSAVEL_COMERCIAL').subscribe(result => {
      this.responsavelComercial = result.valorDominio;
    });
  }

  carregarGrupoEconomico() {
    this.createEmpresaForm.get('grupoEconomicoId').setValue(this.grupoEconomicoId);

    this.gruposEconomicosService.obterGrupoEconomico(this.grupoEconomicoId).subscribe(response => {
      if (response.errors) { return; }
      this.createEmpresaForm.get('grupoEconomico').setValue(response.nome);
    })
  }

  toggleIeIsento() {
    if (this.createEmpresaForm.controls['inscricaoEstadual'].disabled) {
      this.createEmpresaForm.controls['inscricaoEstadual'].setValue('');
      this.createEmpresaForm.controls['inscricaoEstadual'].enable();
    } else {
      this.createEmpresaForm.controls['inscricaoEstadual'].setValue('ISENTO');
      this.createEmpresaForm.controls['inscricaoEstadual'].disable();

    }
  }

  validarDuplicidadeCnpj() {
    if (this.createEmpresaForm.get('cnpj').valid) {
      this.empresasService.validarDuplicidadeCnpj(this.createEmpresaForm.get('cnpj').value).subscribe(result => {
        this.createEmpresaForm.get('cnpj').setValidators(Validators.compose([Validators.required, Utility.isValidCnpj(), Utility.dynamicValidator(() => { return result.id != undefined }, 'cnpjDuplicado')]));
        this.createEmpresaForm.get('cnpj').updateValueAndValidity();
      })

      return;
    }

    this.createEmpresaForm.get('cnpj').setValidators(Validators.compose([Validators.required, Utility.isValidCnpj()]));
    this.createEmpresaForm.get('cnpj').updateValueAndValidity();
  }

  voltar() {
    if (this.empresaId) {
      this.router.navigate([`../../`], { relativeTo: this.activatedRoute });
      return;
    }

    this.router.navigate([`../`], { relativeTo: this.activatedRoute });
  }

  setGrupo(razaosocial) {
    if ((!this.createEmpresaForm.get('id').value) && this.grupoEconomicoId == null) { this.createEmpresaForm.get('grupoEconomico').setValue(razaosocial); }
  }

  editEndereco(enderecoId) {
    this.enderecoToEdit = this.listaEnderecos.find(endereco => endereco.id == enderecoId);
    this.openEndereco('edit');
  }

  setFileListLength(length) {
    this.fileListLength = length;
  }
}
