import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { CriarCargoRequest } from '../../../../core/requests/empresas/criar-cargo.request';
import { CriarDepartamentoRequest } from '../../../../core/requests/empresas/criar-departamento.request';
import { EmpresasService } from '../../../../services/empresas.service';
import { UsuariosEmpresaService } from '../../../../services/usuarios-empresa.service';
import { DominioService } from '../../../../services/dominio.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';

import { Store } from '@ngrx/store';
import { CriarUsuarioEmpresaRequest } from '../../../../core/requests/empresas/criar-usuario-empresa.request';
import { Utility } from 'src/app/core/common/utility';
import { Departamentos } from '../../../../core/models/empresas/departamentos.model';
import { Cargos } from '../../../../core/models/empresas/cargos.model';
import { Permissao } from 'src/app/modules/sistemas/sub-modules/admin/core/models/perfis/permissao.model';

@Component({
  selector: 'app-criar-usuario-master',
  templateUrl: './criar-usuario-master.component.html',
  styleUrls: ['./criar-usuario-master.component.scss']
})
export class CriarUsuarioMasterComponent implements OnInit {
  createUsuarioForm: FormGroup;
  tiposDepartamentos: Departamentos[];
  tiposCargos: Cargos[];
  empresaId: number;
  dadosEditar: boolean = true;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private empresasService: EmpresasService,
    private usuariosEmpresaService: UsuariosEmpresaService,
    private notifierService: NotifierService,
    private activatedRoute: ActivatedRoute,
    private store: Store<{ preloader: IPreloaderState }>
  ) {
    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd;
      if (navEnd) {
        this.empresaId = +val['url'].split('atualizar-empresa')[1]?.split('/')[1]
      }
    });
  }

  ngOnInit(): void {
    this.initilizeForm();
    this.loadDepartment();
    this.loadRole();
    this.loadUsuarioMaster();

    this.createUsuarioForm.controls.cargo.valueChanges.subscribe(value => {
      if (value > 0) {
        if (!this.novoCargo(value)) {
          Utility.changeFieldValidators(this.createUsuarioForm, 'novoCargo', [Validators.nullValidator])
        }
      }
    })

    this.createUsuarioForm.controls.departamento.valueChanges.subscribe(value => {
      if (value > 0) {
        if (!this.novoDepartamento(value)) {
          Utility.changeFieldValidators(this.createUsuarioForm, 'novoDepartamento', [Validators.nullValidator])
        }
      }
    })
  }

  initilizeForm(): void {
    this.createUsuarioForm = this.formBuilder.group({
      nome: ['', Validators.required],
      sobrenome: ['', Validators.required],
      cpf: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")])],
      departamento: ['', Validators.required],
      cargo: ['', Validators.required],
      telefone: ['', Validators.required],
      ramal: [''],
      novoDepartamento: [null],
      novoCargo: [null],
      usuarioGuid: [null],
      perfilId: [0],
      recebeComunicados: [true]
    })
  }

  novoDepartamento(departamentoId) {
    return this.tiposDepartamentos?.filter(departamento => departamento.id == departamentoId)[0]?.nome == 'Outros';
  }

  novoCargo(cargoId) {
    return this.tiposCargos?.filter(cargo => cargo.id == cargoId)[0]?.nome == 'Outros';
  }

  adicionarDepartamento(value) {
    this.empresasService.criarDepartamento(this.empresaId, <CriarDepartamentoRequest>{ nome: value }).subscribe(result => {
      if (result.departamentoId) {
        this.loadDepartment();
        this.createUsuarioForm.get('departamento').setValue(result.departamentoId);
      }
    })
  }

  adicionarCargo(value) {
    this.empresasService.criarCargo(this.empresaId, <CriarCargoRequest>{ nome: value }).subscribe(result => {
      if (result.cargoId) {
        this.loadRole();
        this.createUsuarioForm.get('cargo').setValue(result.cargoId);
      }
    })
  }

  loadDepartment() {
    this.empresasService.obterDepartamentos(this.empresaId).subscribe(result => {
      this.tiposDepartamentos = result.departamentos;
    })
  }

  loadRole() {
    this.empresasService.obterCargos(this.empresaId).subscribe(result => {
      this.tiposCargos = result.cargos;
    })
  }

  loadUsuarioMaster() {
    this.store.dispatch(showPreloader({ payload: '' }))
    this.usuariosEmpresaService.obterUsuarioMaster(this.empresaId).subscribe(result => {
      if (result.errors) {
        this.createUsuarioForm.reset();
        this.store.dispatch(closePreloader())
        return;
      }

      this.createUsuarioForm.setValue({
        nome: result.primeiroNome,
        sobrenome: result.sobrenome,
        cpf: result.documento,
        email: result.email,
        departamento: result.departamentoId,
        cargo: result.cargoId,
        telefone: result.telefone,
        ramal: result.ramal,
        novoDepartamento: null,
        novoCargo: null,
        usuarioGuid: result.usuarioGuid,
        perfilId: result.perfil.id,
        recebeComunicados: result.recebeComunicados
      });

      this.createUsuarioForm.get('email').disable();

      Utility.waitFor(() => { this.store.dispatch(closePreloader()) }, 3000)
    })
  }

  submitUsuarioMaster() {
    let usuario = <CriarUsuarioEmpresaRequest>{
      primeiroNome: this.createUsuarioForm.get('nome').value,
      sobrenome: this.createUsuarioForm.get('sobrenome').value,
      telefone: this.createUsuarioForm.get('telefone').value,
      ramal: this.createUsuarioForm.get('ramal').value,
      documento: this.createUsuarioForm.get('cpf').value,
      email: this.createUsuarioForm.get('email').value,
      ehMaster: true,
      empresaId: this.empresaId,
      departamentoId: this.createUsuarioForm.get('departamento').value,
      cargoId: this.createUsuarioForm.get('cargo').value,
      recebeComunicados: this.createUsuarioForm.get('recebeComunicados').value ?? false,
      perfilId: this.createUsuarioForm.get('perfilId').value ?? 0
    };

    this.store.dispatch(showPreloader({ payload: '' }))

    if (this.createUsuarioForm.get('usuarioGuid').value == null) {
      this.usuariosEmpresaService.criarUsuarioMaster(usuario).subscribe(
        (response) => {
          if (response.errors) {
            this.notifierService.showNotification(response.errors[0].message, response.errors[0].code, 'error');
            this.store.dispatch(closePreloader())
            return;
          }

          this.notifierService.showNotification('Usuário criado.', 'Sucesso', 'success')
          this.fecharDados()
          this.store.dispatch(closePreloader())
        },
        error => {
          this.notifierService.showNotification('Ocorreu um erro interno', 'Erro interno', 'error')
          this.store.dispatch(closePreloader())
        }
      );

      return;
    }

    this.usuariosEmpresaService.atualizarUsuario(this.createUsuarioForm.get('usuarioGuid').value, usuario)
      .subscribe(result => {
        if (result.errors) {
          this.notifierService.showNotification(result.errors[0].message, result.errors[0].code, 'error');
          this.store.dispatch(closePreloader())
          return;
        }

        this.store.dispatch(closePreloader())
        this.notifierService.showNotification('Usuário atualizado.', 'Sucesso', 'success');
        this.fecharDados()
        this.store.dispatch(closePreloader())
      },
        error => this.store.dispatch(closePreloader())
      );
  }

  editarDados() {
    this.dadosEditar = true
  }

  fecharDados() {
    this.dadosEditar = false
  }

  concluir() {
    this.router.navigate([`../../../../`], { relativeTo: this.activatedRoute })
    return
  }

  voltar() {
    this.router.navigate([`../`], { relativeTo: this.activatedRoute })
  }
}
