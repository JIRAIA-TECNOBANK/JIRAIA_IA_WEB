import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuariosEmpresaService } from '../../../../services/usuarios-empresa.service';
import { DominioService } from '../../../../services/dominio.service';
import { Dominios } from '../../../../core/models/dominios/dominios.model';
import {
  closePreloader,
  showPreloader,
} from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-usuario-master',
  templateUrl: './usuario-master.component.html',
  styleUrls: ['./usuario-master.component.scss'],
})
export class UsuarioMasterComponent implements OnInit {
  @Input('companyId') companyId: any;

  userMasterForm = this.formBuilder.group({
    id: null,
    nome: [{ value: '', disabled: true }, Validators.required],
    sobrenome: [{ value: '', disabled: true }, Validators.required],
    telefone: [{ value: '', disabled: true }, Validators.required],
    email: [
      { value: '', disabled: true },
      Validators.compose([
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        Validators.required,
      ]),
    ],
    cpf: [{ value: '', disabled: true }],
    departamento: [{ value: '', disabled: true }, Validators.required],
    cargo: [{ value: '', disabled: true }, Validators.required],
  });

  cargos: Dominios[];
  departamentos: Dominios[];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private store: Store<{ preloader: IPreloaderState }>,
    private formBuilder: UntypedFormBuilder,
    private usuarioEmpresaService: UsuariosEmpresaService,
    private dominioService: DominioService
  ) {
    if (this.activatedRoute.snapshot.params['empresaId'] != undefined) {
      this.companyId = this.activatedRoute.snapshot.params['empresaId'];
    }
  }

  hasUser() {
    return this.userMasterForm.get('id').value ? false : true;
  }

  ngOnInit(): void {
    this.companyId && this.getMasterUser();
    this.getDepartment();
    this.getRole();
  }

  getMasterUser() {
    this.store.dispatch(showPreloader({ payload: '' }));
    this.usuarioEmpresaService
      .obterUsuarioMaster(this.companyId)
      .subscribe((response) => {
        if (response.id) {
          this.store.dispatch(closePreloader());
          this.userMasterForm.setValue({
            id: response.id,
            nome: response.primeiroNome,
            sobrenome: response.sobrenome,
            telefone: response.telefone,
            email: response.email,
            cpf: response.documento,
            departamento: response.departamentoId,
            cargo: response.cargoId,
          });
        } else {
          this.store.dispatch(closePreloader());
        }
      });
  }

  goToCompanies() {
    this.router.navigate([`../../../`], { relativeTo: this.activatedRoute });
  }

  // load dropdowns
  getDepartment() {
    this.dominioService
      .obterPorTipo('DEPARTAMENTO_PRE_DEFINIDO')
      .subscribe((result) => {
        this.departamentos = result.valorDominio;
      });
  }

  getRole() {
    this.dominioService
      .obterPorTipo('CARGO_PRE_DEFINIDO')
      .subscribe((result) => {
        this.cargos = result.valorDominio;
      });
  }
}
