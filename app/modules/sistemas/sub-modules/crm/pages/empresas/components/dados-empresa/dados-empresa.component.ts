import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import {
  closePreloader,
  showPreloader,
} from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { Dominios } from '../../../../core/models/dominios/dominios.model';
import { SubmitEmpresasRequest } from '../../../../core/requests/empresas/criar-empresa.request';
import { DominioService } from '../../../../services/dominio.service';
import { EmpresasService } from '../../../../services/empresas.service';

@Component({
  selector: 'app-dados-empresa',
  templateUrl: './dados-empresa.component.html',
  styleUrls: ['./dados-empresa.component.scss'],
})
export class DadosEmpresaComponent implements OnInit {
  @Output() nextStep: EventEmitter<number> = new EventEmitter<number>();
  @Output() empresaId: EventEmitter<any> = new EventEmitter<any>();
  @Input('companyId') companyId: any;

  companyForm = this.formBuilder.group({
    id: null,
    cnpj: [
      '',
      Validators.compose([Validators.required, Utility.isValidCnpj()]),
    ],
    razaoSocial: ['', Validators.compose([Validators.required, Validators.maxLength(60)])],
    nomeFantasia: ['', Validators.required],
    ieIsento: false,
    inscricaoEstadual: ['', Validators.maxLength(20)],
    inscricaoMunicipal: ['', Validators.maxLength(20)],
    grupoEconomico: [{ value: null, disabled: true }],
    grupoEconomicoId: null,
    tipoEmpresa: ['', Validators.required],
    comercialResponsavel: ['', Validators.required],
    email: ['', Validators.required],
    telefone: ['', Validators.required],
    criarGrupoEconomico: false,
    cadastroOriginadoContran: false
  });

  grupoEconomicoId: number = null;
  messagePreloader: string = '';

  tiposEmpresa: Dominios[];
  responsavelComercial: Dominios[];

  utility = Utility;
  Permissoes = Permissoes;

  // booleans
  ieIsento: boolean = false;
  childstate: boolean = false;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private empresasService: EmpresasService,
    private dominioService: DominioService,
    private notifierService: NotifierService,
    private store: Store<{ preloader: IPreloaderState }>,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.companyId = this.activatedRoute.snapshot.params['empresaId'];
    this.grupoEconomicoId =
      this.activatedRoute.parent.params['_value']['grupoEconomicoId'];

    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd;
      if (navEnd) {
        this.childstate = val['url']
          .split('atualizar-empresa')[1]
          ?.includes('produtos');

        // this.criacaoEmpresa = val['url']?.includes('criar-empresa');
      }
    });
  }

  isCompanyFormValid() {
    return this.companyForm.valid;
  }

  ngOnInit(): void {
    this.carregarTipoEmpresa();
    this.carregarResponsavelComercial();

    if (!Utility.getPermission([Permissoes.GESTAO_EMPRESA_CADASTRAR])) {
      Utility.modoConsulta(this.companyForm);
    }

    if (this.companyId) {
      this.carregaDadosEmpresa(this.companyId);
    }
  }

  carregaDadosEmpresa(empresaId: number) {
    // if (empresaId == null) {
    //   this.companyForm.reset();
    //   return;
    // }

    this.companyForm.get('cnpj').disable();
    this.store.dispatch(showPreloader({ payload: this.messagePreloader }));

    this.empresasService.obterEmpresa(empresaId).subscribe(
      (result) => {
        this.companyForm.patchValue({
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
          criarGrupoEconomico: false,
          cadastroOriginadoContran: result.cadastroOriginadoContran
        });

        if (result.inscricaoEstadual == 'ISENTO') {
          this.companyForm.get('ieIsento').patchValue(true);
          this.companyForm.get('inscricaoEstadual').disable();
        }

        this.companyForm.get('razaoSocial').markAsTouched();
        this.companyForm.get('nomeFantasia').markAsTouched();
        this.store.dispatch(closePreloader());
      },
      (error) => this.store.dispatch(closePreloader())
    );
  }

  // setGrupo(razaosocial) {
  //   if (!this.companyForm.get('id').value && this.grupoEconomicoId == null) {
  //     this.companyForm.get('grupoEconomico').setValue(razaosocial);
  //   }
  // }

  toggleIeIsento() {
    if (this.companyForm.controls['inscricaoEstadual'].disabled) {
      this.companyForm.controls['inscricaoEstadual'].setValue('');
      this.companyForm.controls['inscricaoEstadual'].enable();
    } else {
      this.companyForm.controls['inscricaoEstadual'].setValue('ISENTO');
      this.companyForm.controls['inscricaoEstadual'].disable();
    }
  }

  onSubmit() {
    let empresa = <SubmitEmpresasRequest>{
      id: this.companyForm.get('id').value,
      nomeFantasia: this.companyForm.get('nomeFantasia').value,
      cnpj: this.companyForm.get('cnpj').value,
      razaoSocial: this.companyForm.get('razaoSocial').value,
      inscricaoEstadual: this.companyForm.get('inscricaoEstadual').value,
      inscricaoMunicipal: this.companyForm.get('inscricaoMunicipal').value,
      tipoEmpresaId: this.companyForm.get('tipoEmpresa').value,
      comercialResponsavelId: this.companyForm.get('comercialResponsavel')
        .value,
      ativo: true,
      grupoEconomicoId: this.companyForm.get('grupoEconomicoId').value ?? 0,
      email: this.companyForm.get('email').value,
      telefone: this.companyForm.get('telefone').value,
      criarGrupoEconomico: this.grupoEconomicoId == null,
      cadastroOriginadoContran: this.companyForm.get('cadastroOriginadoContran').value
    };

    if (this.companyForm.get('id').value == null) {
      this.createCompany(empresa);
    } else {
      this.updateCompany(empresa);
    }
  }

  async createCompany(empresa: SubmitEmpresasRequest) {
    this.store.dispatch(showPreloader({ payload: this.messagePreloader }));
    this.empresasService.criarEmpresa(empresa).subscribe((result) => {
      if (result.empresaId) {
        this.companyForm.get('id').setValue(result.empresaId);
        this.notifierService.showNotification(
          'Empresa criada.',
          'Sucesso',
          'success'
        );
        this.store.dispatch(closePreloader());
        this.empresaId.emit(result.empresaId);
        this.nextStep.emit(1);
      }
    });
  }

  updateCompany(empresa: SubmitEmpresasRequest) {
    this.store.dispatch(showPreloader({ payload: this.messagePreloader }));
    this.empresasService.atualizarEmpresa(this.companyId, empresa).subscribe(
      (result) => {
        if (result.empresaId) {
          this.notifierService.showNotification(
            'Empresa editada.',
            'Sucesso',
            'success'
          );
          this.store.dispatch(closePreloader());
        }
        this.store.dispatch(closePreloader());
      },
      (error) => this.store.dispatch(closePreloader())
    );
    this.nextStep.emit(1);
  }

  // Utilities
  validarDuplicidadeCnpj() {
    if (this.companyForm.get('cnpj').value.length >= 14) {

      this.empresasService
        .validarDuplicidadeCnpj(this.companyForm.get('cnpj').value)
        .subscribe((result) => {
          this.companyForm.get('cnpj').setValidators(
            Validators.compose([
              Validators.required,
              Utility.isValidCnpj(),
              Utility.dynamicValidator(() => {
                return result.id == undefined;
              }, 'cnpjDuplicado'),
              Utility.isValidCnpj()])
          );
          this.companyForm.get('cnpj').updateValueAndValidity();
        });

      return;
    }
  }

  // Load Dropdowns
  carregarTipoEmpresa() {
    this.dominioService.obterPorTipo('TIPO_EMPRESA').subscribe((result) => {
      this.tiposEmpresa = result.valorDominio;
    });
  }

  carregarResponsavelComercial() {
    this.dominioService
      .obterPorTipo('RESPONSAVEL_COMERCIAL')
      .subscribe((result) => {
        this.responsavelComercial = result.valorDominio;
      });
  }
}
