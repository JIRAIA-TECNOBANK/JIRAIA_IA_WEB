import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatLegacyAutocompleteSelectedEvent as MatAutocompleteSelectedEvent } from '@angular/material/legacy-autocomplete';
import { MatLegacyChipInputEvent as MatChipInputEvent } from '@angular/material/legacy-chips';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { Dominios } from 'src/app/modules/sistemas/sub-modules/crm/core/models/dominios/dominios.model';
import { chipsEmailModel } from 'src/app/modules/sistemas/sub-modules/crm/core/models/empresas/chips-email-model';
import { Empresas } from 'src/app/modules/sistemas/sub-modules/crm/core/models/empresas/empresas.model';
import { NotificacaoRequest } from 'src/app/modules/sistemas/sub-modules/crm/core/requests/notificacao/notificacao.request';
import { DominioService } from 'src/app/modules/sistemas/sub-modules/crm/services/dominio.service';
import { EmpresasService } from 'src/app/modules/sistemas/sub-modules/crm/services/empresas.service';
import { NotificacoesService } from 'src/app/modules/sistemas/sub-modules/crm/services/notificacoes.service';
import { UsuariosEmpresaService } from 'src/app/modules/sistemas/sub-modules/crm/services/usuarios-empresa.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';

@Component({
  selector: 'app-criar-notificacao',
  templateUrl: './criar-notificacao.component.html',
  styleUrls: ['./criar-notificacao.component.scss'],
})
export class CriarNotificacaoComponent implements OnInit {

  constructor(private fb: UntypedFormBuilder,
    private notifierService: NotifierService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private notificacoesService: NotificacoesService,
    private dominioService: DominioService,
    private store: Store<{ preloader: IPreloaderState }>,
    private empresaService: EmpresasService,
    private usuariosService: UsuariosEmpresaService) {
    this.notificacaoId = this.activatedRoute.snapshot.params['notificacaoId'];
    this.filteredUsuarios = this.usuariosControl.valueChanges.pipe(
      startWith(null),
      map((usuario: string | null) => (usuario ? this._filter(usuario) : this.allUsuarios.slice())),
    );

    this.minDate = new Date();
  }

  @ViewChild("fileDropRef", { static: false }) fileDropEl: ElementRef;
  @ViewChild('usuarioInput') usuarioInput: ElementRef<HTMLInputElement>;

  utility = Utility;
  Permissoes = Permissoes;

  htmlContent = '';
  config: AngularEditorConfig = {
    editable: Utility.getPermission([Permissoes.GESTAO_COMUNICADOS_CADASTRAR]),
    spellcheck: true,
    height: '15rem',
    minHeight: '5rem',
    placeholder: '',
    translate: 'no ',
    defaultParagraphSeparator: 'span',
    defaultFontName: 'Arial',
    outline: false,
    fonts: [
      { class: 'arial', name: 'Arial' },
      { class: 'calibri', name: 'Calibri' },
      { class: 'montserrat', name: 'Montserrat' },
      { class: 'segoe-ui', name: 'Segoe UI' },
      { class: 'times-new-roman', name: 'Times New Roman' },
    ],
    toolbarHiddenButtons: [
      [
        'undo',
        'redo',
        'subscript',
        'superscript',
        'justifyLeft',
        'justifyCenter',
        'justifyRight',
        'justifyFull',
        'indent',
        'outdent',
        'heading',
      ],
      [
        'backgroundColor',
        'customClasses',
        'insertImage',
        'insertVideo',
        'insertHorizontalRule',
        'removeFormat',
        'toggleEditorMode'
      ]
    ]
  };

  formulario: FormGroup;
  header: string = './assets/img/header-preview.png';

  notificacaoId: number = null;

  files: any = null;
  acceptedTypes: string[] = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  pipe = new DatePipe('en-US');
  imagemURL: string = "";
  loading: boolean = false;
  fileName: string = "";
  fileDetails: string = "";
  fileExtension: string = "";

  categorias: Dominios[];

  empresas: Empresas[] = [];
  empresasFiltradas: Empresas[] = [];

  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredUsuarios: Observable<chipsEmailModel[]>;
  usuarios: chipsEmailModel[] = [];
  allUsuarios: chipsEmailModel[] = [];
  usuariosControl: FormControl = new FormControl();
  showUsuariosChip: boolean = false;

  minDate: Date;

  empresaSelecionada: number = null;

  ngOnInit(): void {
    this.initializeForm();
    if (this.notificacaoId) {
      this.store.dispatch(showPreloader({ payload: '' }));
      this.carregaNotificacao();
    }

    if (!Utility.getPermission([Permissoes.GESTAO_COMUNICADOS_CADASTRAR])) {
      Utility.modoConsulta(this.formulario);
    }

    this.carregarEmpresas();
  }

  /**
   * Trigger para o click do input file
   * @param fileDropRef (Input file)
   */
  onClickFile(fileDropRef: any) {
    if (!Utility.getPermission([Permissoes.GESTAO_COMUNICADOS_CADASTRAR])) return;
    fileDropRef.click();
  }

  fileBrowseHandler(files) {
    if (!Utility.getPermission([Permissoes.GESTAO_COMUNICADOS_CADASTRAR])) return;
    this.prepareFilesList(files);
  }

  onFileDropped($event) {
    if (!Utility.getPermission([Permissoes.GESTAO_COMUNICADOS_CADASTRAR])) return;
    this.prepareFilesList($event);
  }

  getImage() {
    if (this.formulario?.get('imagemBase64').value) {
      return this.formulario?.get('imagemBase64').value;
    }

    if (this.formulario?.get('urlImagem').value) {
      return this.formulario?.get('urlImagem').value;
    }

    return this.header;
  }

  getTextoBotao() {
    if (this.formulario?.get('descricaoBotao').value) {
      return this.formulario?.get('descricaoBotao').value;
    }

    return 'Entendi';
  }

  onClickConfirmar() {
    if (!this.formulario.valid) return;

    this.store.dispatch(showPreloader({ payload: '' }));
    this.submitNotificacao();
  }

  carregarEmpresas(filtro: string = null) {
    if (filtro) {
      const valueInput = filtro.toLocaleLowerCase()

      this.empresaService.obterEmpresasFiltro(0, 10, valueInput).subscribe(response => {
        if (response.isSuccessful) {
          this.empresas = response.empresas;
          this.formatarEmpresas(response.empresas);
        }
      })

      return;
    }

    this.empresaService.obterEmpresas(0, 10).subscribe(response => {
      if (response.isSuccessful) {
        this.empresas = response.empresas;
        this.formatarEmpresas(response.empresas);
      }
    });
  }

  selecionaEmpresaId() {
    let empresaSelecionada = this.formulario.get('empresaNome').value;
    if (!empresaSelecionada) {
      this.formulario.get('empresaId').reset();
      return;
    }

    let empresaTxt = this.formulario.get('empresaNome').value.split(' - ');
    let cnpj = this.formulario.get('empresaNome').value.split(' - ')[empresaTxt.length - 1];

    if (!cnpj) {
      this.formulario.get('empresaId').reset();
      return;
    }

    let empresaCnpj = this.empresas.filter(e => Utility.checkNumbersOnly(e.cnpj).indexOf(Utility.checkNumbersOnly(cnpj)) > -1)[0];
    if (!empresaCnpj) {
      this.formulario.get('empresaId').reset();
      return;
    }

    this.formulario.get('empresaId').setValue(empresaCnpj.id);
    this.carregarUsuarios(this.formulario.get('empresaId').value);
  }

  carregarUsuarios(empresaId: number) {
    this.allUsuarios = [];
    this.usuariosControl.reset();
    this.usuariosService.obterUsuarios(empresaId, 0, 200).subscribe(response => {
      if (response.usuarios) {
        this.showUsuariosChip = true;
        response.usuarios.forEach(usuario => {
          this.allUsuarios.push(<chipsEmailModel>{ nome: usuario.nomeCompleto, email: usuario.email, usuarioId: usuario.id });
        });
        return;
      }
      this.notifierService.showNotification('Esta empresa não possui usuários!', '', 'warning');
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
    this.formulario.get('usuarios').setValue(this.usuarios?.map(usuario => usuario.usuarioId));
  }

  private _filter(value: string): chipsEmailModel[] {
    const filterValue = value.toLowerCase();
    return this.allUsuarios.filter(usuario => usuario.nome.toLowerCase().includes(filterValue));
  }

  public verifyUsuarioAdicionado(usuario: chipsEmailModel): boolean {
    return this.usuarios.filter(u => u.email == usuario.email).length > 0;
  }

  private formatarEmpresas(empresas: Empresas[]) {
    let empresasLista = empresas;
    empresasLista.forEach(empresa => { empresa.cnpj = Utility.formatCnpj(empresa.cnpj) });
    this.empresasFiltradas = empresasLista;
  }

  private initializeForm() {
    this.formulario = this.fb.group({
      tipoNotificacao: [1, Validators.required],
      tipoFrequencia: [2, Validators.required],
      ehNotificaTodosClientes: [true],
      statusNotificacaoId: [1],
      titulo: ['', Validators.compose([Validators.required, Validators.maxLength(150)])],
      mensagem: ['', Validators.required],
      categoriaID: ['', Validators.required],
      urlImagem: [null],
      nomeArquivoImagem: [null],
      imagemBase64: [null],
      direcionamentoBotao: [null],
      descricaoBotao: ['Entendi'],
      urlBotao: [''],
      agendar: [false],
      dataAgendamento: [null],
      ativo: [true],
      empresaNome: [null],
      empresaId: [null],
      usuarios: [null],
      dataInicio: [null],
      dataFim: [null]
    });

    this.formulario.get('direcionamentoBotao').valueChanges.subscribe(value => {
      if (!value) {
        this.formulario.get('descricaoBotao').reset();
        this.formulario.get('urlBotao').reset();
        return;
      }
    })

    this.formulario.get('ehNotificaTodosClientes').valueChanges.subscribe(value => {
      if (value) {
        this.formulario.get('empresaId').reset();
        this.formulario.get('empresaNome').reset();
        this.formulario.get('usuarios').reset();
        this.usuariosControl.reset();
        this.usuarios = [];
        Utility.changeFieldValidators(this.formulario, 'empresaId', [Validators.nullValidator]);
        Utility.changeFieldValidators(this.formulario, 'usuarios', [Validators.nullValidator]);
        return;
      }

      Utility.changeFieldValidators(this.formulario, 'empresaId', [Validators.required]);
      Utility.changeFieldValidators(this.formulario, 'usuarios', [Validators.required]);
    })

    this.formulario.get('empresaId').valueChanges.subscribe(value => {
      if (this.empresaSelecionada == value) return;
      this.empresaSelecionada = value;
      this.formulario.get('usuarios').reset();
      this.usuariosControl.reset();
      this.usuarios = [];
      return;
    })

    this.formulario.get('agendar').valueChanges.subscribe(value => {
      if (value) {
        Utility.changeFieldValidators(this.formulario, 'dataAgendamento', [Validators.required]);
        return;
      }

      this.formulario.get('dataAgendamento').reset();
      Utility.changeFieldValidators(this.formulario, 'dataAgendamento', [Validators.nullValidator]);
    })

    this.formulario.get('tipoFrequencia').valueChanges.subscribe(value => {
      if (this.formulario.get('tipoNotificacao').value == 1) {
        if (value == 2) {
          this.datesRequired();
          return;
        }

        this.datesNullable();
      }
    });

    this.formulario.get('tipoNotificacao').valueChanges.subscribe(value => {
      if (value == 1) {
        this.datesRequired();
        return;
      }

      this.datesNullable();
    });

    this.carregaCategorias();
  }

  private datesRequired() {
    Utility.changeFieldValidators(this.formulario, 'dataInicio', [Validators.required]);
    Utility.changeFieldValidators(this.formulario, 'dataFim', [Validators.required]);
  }

  private datesNullable() {
    this.formulario.get('dataInicio').reset();
    this.formulario.get('dataFim').reset();
    Utility.changeFieldValidators(this.formulario, 'dataInicio', []);
    Utility.changeFieldValidators(this.formulario, 'dataFim', []);
  }

  private submitNotificacao() {
    let descricaoBotao = null;
    if (this.formulario.get('tipoNotificacao').value == 2 && this.formulario.get('direcionamentoBotao').value) descricaoBotao = this.formulario.get('descricaoBotao').value;

    let notificacao: NotificacaoRequest = {
      tipoNotificacao: this.formulario.get('tipoNotificacao').value,
      tipoFrequencia: this.formulario.get('tipoFrequencia').value,
      ehNotificaTodosClientes: this.formulario.get('ehNotificaTodosClientes').value,
      statusNotificacaoId: +this.formulario.get('statusNotificacaoId').value,
      titulo: this.formulario.get('titulo').value,
      mensagem: this.formulario.get('mensagem').value,
      categoriaID: this.formulario.get('categoriaID').value,
      urlImagem: this.formulario.get('urlImagem').value,
      nomeArquivoImagem: this.formulario.get('nomeArquivoImagem').value,
      imagemBase64: this.formulario.get('imagemBase64').value?.split('base64,')[1] ?? '',
      descricaoBotao: descricaoBotao,
      urlBotao: this.formulario.get('urlBotao').value,
      agendar: this.formulario.get('agendar').value,
      dataAgendamento: this.formulario.get('dataAgendamento').value,
      ativo: this.formulario.get('ativo').value,
      empresaId: this.formulario.get('empresaId').value,
      usuarios: this.formulario.get('usuarios').value,
      dataInicio: this.formulario.get('dataInicio').value,
      dataFim: this.formulario.get('dataFim').value,
    };

    if (this.notificacaoId) {
      this.editarNotificacao(notificacao);
      return;
    }

    this.criarNotificacao(notificacao);
  }

  private criarNotificacao(notificacao: NotificacaoRequest) {
    this.notificacoesService.criarNotificacao(notificacao).subscribe(response => {
      if (response.id) {
        this.store.dispatch(closePreloader());
        this.voltar();
        this.notifierService.showNotification(notificacao.tipoNotificacao == 1 ? 'Notificação para o Portal enviada com sucesso!' : 'Notificação por e-mail enviada com sucesso!', '', 'success');
        return;
      }

      this.store.dispatch(closePreloader());
      this.notifierService.showNotification(response.errors[0].message, '', 'error');
    });
  }

  private editarNotificacao(notificacao: NotificacaoRequest) {
    this.notificacoesService.editarNotificacao(this.notificacaoId, notificacao).subscribe(response => {
      if (response.id) {
        this.store.dispatch(closePreloader());
        this.voltar();
        this.notifierService.showNotification(notificacao.tipoNotificacao == 1 ? 'Notificação para o Portal editada com sucesso!' : 'Notificação por e-mail editada com sucesso!', '', 'success');
        return;
      }

      this.store.dispatch(closePreloader());
      this.notifierService.showNotification(response.errors[0].message, '', 'error');
    });
  }

  /**
   * Converte a lista de arquivos para uma lista normal
   * @param files (Files List)
   */
  private prepareFilesList(files: Array<any>) {
    this.files = null;
    this.files = files[0];

    if (this.acceptedTypes.find(type => type === files[0].type) === undefined) {
      this.notifierService.showNotification('Falha no upload, o formato é incompatível.', '', 'error');
      this.formulario.get('imagemBase64').reset();
      return false;
    }

    if (!this.formatBytes(files[0].size)) {
      this.notifierService.showNotification('Falha no upload, tamanho superior ao permitido.', '', 'error');
      this.formulario.get('imagemBase64').reset();
      return false;
    }

    this.setImageData(files);

    this.fileDropEl.nativeElement.value = "";
  }

  /**
  * Seta o DialogData com a base64 do arquivo selecionado
  * @param files (Lista de arquivos do input)
  */
  private setImageData(files) {
    const file = files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let base64 = reader.result.toString();
      this.fileExtension = file.name.split('.').pop();
      let nomeArquivo = file.name.replace("." + this.fileExtension, "");
      let valor = nomeArquivo;
      if (valor.length > 30) {
        let invalidChar = 30 - valor.length;
        valor = valor.slice(0, invalidChar)
      }

      this.fileName = valor + "." + this.fileExtension;

      this.formulario.get('imagemBase64').setValue(base64);
      this.formulario.get('nomeArquivoImagem').setValue(this.fileName);
      this.formulario.get('urlImagem').reset();

      let agora = new Date();
      this.fileDetails = this.pipe.transform(agora, 'dd-MM-yy') + ' às ' + this.pipe.transform(agora, 'HH:mm') + ' - tamanho ' + this.formatBytes(this.files?.size);
    };
  }

  /**
   * Formata os bytes
   * @param bytes (Tamanho do arquivo em bytes)
   * @param decimals (Pontos decimais)
   */
  private formatBytes(bytes, decimals = 2) {
    let megabytes = Utility.formatMegabytes(bytes);
    if (megabytes > 10) {
      this.files = null;
      return false;
    }

    let size = megabytes.toFixed(decimals);
    return size + 'MB';
  }

  private carregaCategorias() {
    this.dominioService.obterPorTipo('CATEGORIA_NOTIFICACAO').subscribe(response => {
      this.categorias = response.valorDominio
    })
  }

  private carregaNotificacao() {
    this.notificacoesService.obterNotificacaoPorId(this.notificacaoId).subscribe(response => {
      this.formulario.patchValue({
        tipoNotificacao: response.tipoNotificacao,
        tipoFrequencia: response.tipoFrequencia,
        ehNotificaTodosClientes: response.ehNotificaTodosClientes,
        statusNotificacaoId: response.statusNotificacaoId,
        titulo: response.titulo,
        mensagem: response.mensagem,
        categoriaID: response.categoriaID,
        urlImagem: response.urlImagem,
        nomeArquivoImagem: response.nomeArquivoImagem,
        imagemBase64: null,
        direcionamentoBotao: response.descricaoBotao,
        descricaoBotao: response.descricaoBotao,
        urlBotao: response.urlBotao,
        agendar: response.agendar,
        dataAgendamento: response.dataAgendamento ? Utility.formatDatePicker(response.dataAgendamento.split(' ')[0], '/') : null,
        ativo: response.ativo,
        empresaNome: response.empresa ? response.empresa.nomeFantasia + ' - ' + Utility.formatCnpj(response.empresa.cnpj) : null,
        empresaId: response.empresa?.id,
        usuarios: response.usuarios?.map(usuario => usuario.id),
        dataInicio: response.dataInicio ? Utility.formatDatePicker(response.dataInicio.split(' ')[0], '/') : null,
        dataFim: response.dataFim ? Utility.formatDatePicker(response.dataFim.split(' ')[0], '/') : null,
      });

      if (response.empresa) {
        this.carregarUsuarios(this.formulario.get('empresaId').value);

        response.usuarios.forEach(usuario => {
          this.usuarios.push(<chipsEmailModel>{
            email: usuario.email,
            nome: usuario.nomeCompleto,
            usuarioId: usuario.id
          })
        });
      }

      this.store.dispatch(closePreloader());
    })
  }

  private voltar() {
    if (this.notificacaoId) {
      this.router.navigate([`../../`], { relativeTo: this.activatedRoute });
      return;
    }

    this.router.navigate([`../`], { relativeTo: this.activatedRoute });
  }
}
