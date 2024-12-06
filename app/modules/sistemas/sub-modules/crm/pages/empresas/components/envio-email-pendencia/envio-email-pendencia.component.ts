import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, FormControl, Validators } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatLegacyChipInputEvent as MatChipInputEvent } from '@angular/material/legacy-chips';
import { Observable } from 'rxjs/internal/Observable';
import { map, startWith } from 'rxjs/operators';

import { Utility } from 'src/app/core/common/utility';
import { DialogCustomService } from 'src/app/shared/services/dialog-custom.service';
import { MatLegacyAutocompleteSelectedEvent as MatAutocompleteSelectedEvent } from '@angular/material/legacy-autocomplete';
import { UsuariosEmpresaService } from '../../../../services/usuarios-empresa.service';
import { chipsEmailModel } from '../../../../core/models/empresas/chips-email-model';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { EmpresasService } from '../../../../services/empresas.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';

@Component({
  selector: 'app-envio-email-pendencia',
  templateUrl: './envio-email-pendencia.component.html',
  styleUrls: ['./envio-email-pendencia.component.scss']
})
export class EnvioEmailPendenciaComponent implements OnInit {

  envioEmailForm = this.formBuilder.group({
    tipoEmailId: [1, Validators.required],
    emails: ['', Validators.required],
  });

  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredUsuarios: Observable<chipsEmailModel[]>;
  usuarios: chipsEmailModel[] = [];
  allUsuarios: chipsEmailModel[] = [];
  usuariosControl: FormControl = new FormControl('');
  empresaId: number = 0;
  showUsuariosChip: boolean = false;

  @ViewChild('usuarioInput') usuarioInput: ElementRef<HTMLInputElement>;

  constructor(private formBuilder: UntypedFormBuilder,
    private dialogService: DialogCustomService,
    private usuariosEmpresaService: UsuariosEmpresaService,
    private empresaService: EmpresasService,
    private notifierService: NotifierService) {
    this.filteredUsuarios = this.usuariosControl.valueChanges.pipe(
      startWith(null),
      map((usuario: string | null) => (usuario ? this._filter(usuario) : this.allUsuarios.slice())),
    );
  }

  ngOnInit(): void {
    let empresaId: number = 0;

    this.dialogService.setDialogData("nodata");
    this.empresaService.empresaId$.subscribe(response => {
      if (response != null) { empresaId = response; }
    });

    this.carregarEmails(empresaId);

    this.envioEmailForm.statusChanges.subscribe((s) => {
      Utility.waitFor(() => {
        if (s == 'VALID') {
          this.dialogService.setDialogData({ dataType: 'envioEmail', data: { tipoEmailId: this.envioEmailForm.get('tipoEmailId').value, emails: this.usuarios.map(usuario => usuario.email) } });
        } else {
          this.dialogService.setDialogData("nodata");
        }
      }, 1000)
    });
  }

  carregarEmails(empresaId: number) {
    this.allUsuarios = [];
    this.usuariosEmpresaService.obterEmails(empresaId).subscribe(response => {
      if (response.emails) {
        this.showUsuariosChip = true;
        response.emails.forEach(usuario => {
          this.allUsuarios.push(<chipsEmailModel>{ nome: usuario.nome, email: usuario.email });
        });
        return;
      }

      this.notifierService.showNotification('Esta empresa não possui usuários elegíveis para o recebimento de e-mails de pendências!', '', 'warning');
    });
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    let selected = this.allUsuarios.filter(usuario => usuario.nome == value)[0];
    if (!selected || this.usuarios.indexOf(selected) != -1) return;

    if (value) { this.usuarios.push(selected); }

    event.chipInput!.clear();
    this.usuariosControl.setValue(null);
    this.setFormEmails();
  }

  remove(usuario: chipsEmailModel): void {
    const index = this.usuarios.indexOf(usuario);

    if (index >= 0) { this.usuarios.splice(index, 1); }
    this.setFormEmails();
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    let selected = this.allUsuarios.filter(usuario => usuario.nome == event.option.value)[0];
    if (!selected || this.usuarios.indexOf(selected) != -1) return;

    this.usuarios.push(selected);
    this.usuarioInput.nativeElement.value = '';
    this.usuariosControl.setValue(null);
    this.setFormEmails();
  }

  setFormEmails() {
    this.envioEmailForm.get('emails').setValue(this.usuarios?.map(usuario => usuario.email));
  }

  private _filter(value: string): chipsEmailModel[] {
    const filterValue = value.toLowerCase();
    return this.allUsuarios.filter(usuario => usuario.nome.toLowerCase().includes(filterValue));
  }

  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(<TipoElemento>tipoElemento, nomeElemento, guidElemento);
  }

  public verifyUsuarioAdicionado(usuario: chipsEmailModel): boolean {
    return this.usuarios.filter(u => u.email == usuario.email).length > 0;
  }
}
