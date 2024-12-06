import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormGroupDirective, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Store } from '@ngrx/store';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import {
  closePreloader,
  showPreloader,
} from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { CriarContatoRequest } from '../../../../core/requests/empresas/criar-contato.request';
import { DominioService } from '../../../../services/dominio.service';
import { EmpresasService } from '../../../../services/empresas.service';
import { DialogConfirmComponent } from '../dialog-confirm/dialog-confirm.component';

@Component({
  selector: 'app-contatos-adicionais',
  templateUrl: './contatos-adicionais.component.html',
  styleUrls: ['./contatos-adicionais.component.scss'],
})
export class ContatosAdicionaisComponent implements OnInit {
  @ViewChild(FormGroupDirective) formDirective: FormGroupDirective;
  @Output() nextStep: EventEmitter<number> = new EventEmitter<number>();
  @Input('companyId') companyId: number;

  contactForm = this.formBuilder.group({
    id: null,
    nome: ['', Validators.required],
    telefone: ['', Validators.required],
    email: [
      '',
      Validators.compose([
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'),
        Validators.required,
      ]),
    ],
    departamento: [null, Validators.required],
    cargo: [null, Validators.required],
  });
  contacts = [];
  cargos: any[];
  departamentos: any[];

  contactId: number;

  utility = Utility;
  Permissoes = Permissoes;

  // booleans
  isEdition: boolean = false;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private dominioService: DominioService,
    private store: Store<{ preloader: IPreloaderState }>,
    private empresasService: EmpresasService,
    private notifierService: NotifierService,
    public dialog: MatDialog
  ) {}

  getRoleName(cargoId: number) {
    let role: any;
    for (let index = 0; index < this.cargos.length; index++) {
      if (this.cargos[index].id === cargoId) {
        role = this.cargos[index].nome;
        break;
      }
    }
    return role;
  }

  getDepartmentName(departamentoId: number) {
    let department: any;
    for (let index = 0; index < this.departamentos.length; index++) {
      if (this.departamentos[index].id === departamentoId) {
        department = this.departamentos[index].nome;
        break;
      }
    }
    return department;
  }

  hasContact() {
    return this.contacts.length ? true : false;
  }

  hasContactId() {
    return this.contactId ? 'Salvar' : 'Adicionar';
  }

  ngOnInit(): void {
    if (!Utility.getPermission([Permissoes.GESTAO_EMPRESA_CADASTRAR])) {
      Utility.modoConsulta(this.contactForm);
    }

    this.getDepartment();
    this.getRole();
    this.companyId && this.getCompanyContacts();
  }

  addContact() {
    this.toggleEdition();
  }

  editContact(contact) {
    this.contactId = contact.id;
    this.contactForm.patchValue({
      id: contact.id,
      nome: contact.nome,
      email: contact.email,
      telefone: contact.telefone,
      cargo: contact.cargoId,
      departamento: contact.departamentoId,
    });

    this.contactForm && this.toggleEdition();
  }

  cancelContact() {
    this.contactId = null;
    this.formDirective.resetForm();
    this.toggleEdition();
  }

  onSubmit() {
    if (this.contactForm.invalid) {
      return;
    }

    let contato = <CriarContatoRequest>{
      nome: this.contactForm.get('nome').value,
      telefone: this.contactForm.get('telefone').value,
      email: this.contactForm.get('email').value,
      cargoId: this.contactForm.get('cargo').value,
      departamentoId: this.contactForm.get('departamento').value,
    };

    this.store.dispatch(showPreloader({ payload: '' }));

    if (this.contactId) {
      this.updateContact(contato);
    } else {
      this.createContact(contato);
    }
  }

  createContact(contact: CriarContatoRequest) {
    this.empresasService
      .criarEmpresaContato(this.companyId, contact)
      .toPromise()
      .then((result) => {
        if (result.empresaId) {
          this.getCompanyContacts();
          this.store.dispatch(closePreloader());
          this.notifierService.showNotification(
            'Contato criado.',
            'Sucesso',
            'success'
          );
        }
      })
      .catch((result) => {
        this.store.dispatch(closePreloader());
        this.notifierService.showNotification(
          result.errors[0].message,
          result.errors[0].code,
          'error'
        );
      });
    this.formDirective.resetForm();
    this.cancelContact();
  }

  updateContact(contact: CriarContatoRequest) {
    this.empresasService
    .atualizarEmpresaContato(this.companyId, this.contactId, contact)
    .toPromise()
    .then((result) => {
      if (result.errors) {
        this.notifierService.showNotification(
          result.errors[0].message,
          result.errors[0].code,
          'error'
        );
        this.store.dispatch(closePreloader());
        return;
      }
      this.store.dispatch(closePreloader());
      this.notifierService.showNotification(
        'Contato atualizado.',
        'Sucesso',
        'success'
      );
      this.getCompanyContacts();
      this.store.dispatch(closePreloader());
    })
    .catch((result) => {
      this.notifierService.showNotification(
        result.errors[0].message,
        result.errors[0].code,
        'error'
      );
      this.store.dispatch(closePreloader());
    });
    this.cancelContact();
  }

  openDialog(contatoId: number): void {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: { descricao: 'Deseja excluir este contato? ' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'delete') {
        this.deleteContact(contatoId);
      }
    });
  }

  deleteContact(contatoId) {
    this.store.dispatch(showPreloader({ payload: '' }));

    this.empresasService
      .deleteContato(this.companyId, contatoId)
      .toPromise()
      .then((result) => {
        this.notifierService.showNotification(
          'Contato excluído.',
          'Sucesso',
          'success'
        );
        this.getCompanyContacts();
        this.store.dispatch(closePreloader());
      })
      .catch((e) => {
        console.info(e);
      });
  }

  toggleEdition() {
    this.isEdition = !this.isEdition;
  }

  goToNextStep(stepNumber: number) {
    this.nextStep.emit(stepNumber);
  }

  // Load infos

  getCompanyContacts() {
    this.store.dispatch(showPreloader({ payload: '' }));
    this.contacts = [];
    this.empresasService
      .obterEmpresaContatos(this.companyId)
      .subscribe((result) => {
        this.contacts = result.contatosAdicionais;
        this.store.dispatch(closePreloader());
      });
  }

  getDepartment() {
    this.empresasService
      .obterDepartamentos(this.companyId)
      .subscribe((result) => {
        this.departamentos = result.departamentos;
      });
  }

  getRole() {
    this.empresasService.obterCargos(this.companyId).subscribe((result) => {
      this.cargos = result.cargos;
    });
  }
}
