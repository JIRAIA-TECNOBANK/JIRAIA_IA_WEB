import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Utility } from 'src/app/core/common/utility';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { Empresas } from '../../../../../core/models/empresas/empresas.model';
import { PerfisConvidados } from '../../../../../core/models/usuarios-empresa/perfis-convidados.model';
import { UsuarioEmpresaFiltro } from '../../../../../core/models/usuarios-empresa/usuario-empresa-filtro.model';
import { UsuarioEmpresaGrupoEconomico } from '../../../../../core/models/usuarios-empresa/usuario-empresa-grupo-economico.model';
import { UsuariosGrupoEconomico } from '../../../../../core/models/usuarios-empresa/usuarios-grupo-economico.model';
import { ConvidarUsuarioRequest } from '../../../../../core/requests/usuarios/convidar-usuario.request';
import { ObterUsuarioConvidadoResponse } from '../../../../../core/responses/usuarios-empresa/obter-usuario-convidado.response';
import { EmpresasService } from '../../../../../services/empresas.service';
import { GruposEconomicosService } from '../../../../../services/grupos-economicos.service';
import { UsuariosEmpresaService } from '../../../../../services/usuarios-empresa.service';


@Component({
  selector: 'app-usuarios-convidados',
  templateUrl: './usuarios-convidados.component.html',
  styleUrls: ['./usuarios-convidados.component.scss']
})
export class UsuariosConvidadosComponent implements OnInit {

  utility = Utility;

  createUsuarioConvidadoForm = this.formBuilder.group({
    produto: [{ value: '0', disabled: true }],
    tipoUsuario: [''],
    usuarioId: [{ value: null, disabled: true }, Validators.required],
    nomeEmpresa: [{ value: '', disabled: true }],
    nomeUsuario: [{ value: '', disabled: true }],
    empresaIdOrigem: [{ value: '' }, Validators.required],
    perfilId: ['', Validators.required],
    empresaIdConvidado: ['', Validators.required],
    usuarioNome: [{ value: '', disabled: true }],
    empresaNomeConvidado: [{ value: '', disabled: true }],
    empresaNomeOrigem: [{ value: '', disabled: true }]
  });

  perfis: PerfisConvidados[];
  empresas: UsuarioEmpresaGrupoEconomico[];
  usuarios: UsuariosGrupoEconomico[] = [];
  usuariosFiltrados: UsuariosGrupoEconomico[] = [];
  empresasFiltradas: UsuarioEmpresaGrupoEconomico[] = [];
  empresasExternasFiltradas: Empresas[] = [];

  selectedEmpresa = null;
  selectedPerfil = null;

  grupoEconomicoId: number = null;
  usuarioConvidadoId: number = null;
  usuarioConvidadoModel: ObterUsuarioConvidadoResponse;

  mensagemUsuarioInterno: string = 'Ao selecionar essa opção, será permitido convidar somente usuários cadastrados nas empresas pertencentes a esse grupo econômico.';
  mensagemUsuarioExterno: string = 'Ao selecionar essa opção, será permitido convidar para esse grupo usuários que estão cadastrados em empresas que não fazem parte desse grupo econômico.';

  mensagemEmpresaExterna: string = 'Selecione a empresa externa, ou seja, que não pertence a esse grupo econômico e que possui um usuário cadastrado que deseja convidar para atuar numa empresa que pertence a esse grupo econômico.';
  mensagemEmpresa: string = 'Selecione uma das empresas pertencentes a esse grupo econômico para o qual deseja convidar o usuário externo.';

  msgUsrInternoUsuario: string = 'Os usuários disponíveis para seleção são aqueles que não estão cadastrados ou que ainda não foram convidados para atuar na empresa selecionada no campo anterior.';
  msgUsrExternoUsuario: string = 'Selecione o usuário cadastrado na empresa externa selecionada no campo anterior e que gostaria de convidar para atuar numa empresa pertencente a esse grupo econômico.';

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private usuariosService: UsuariosEmpresaService,
    private grupoEconomicoService: GruposEconomicosService,
    private notifierService: NotifierService,
    private store: Store<{ preloader: IPreloaderState }>,
    private empresasService: EmpresasService
  ) {
    this.grupoEconomicoId = this.activatedRoute.parent.params['_value']['grupoEconomicoId'];
    this.usuarioConvidadoId = this.activatedRoute.snapshot.params['id'] ? +this.activatedRoute.snapshot.params['id'] : null;
  }

  ngOnInit(): void {
    this.carregarEmpresasGrupo();
    this.carregarEmpresasExternas();

    this.createUsuarioConvidadoForm.get('perfilId').disable();
    this.createUsuarioConvidadoForm.get('usuarioNome').disable();

    if (this.usuarioConvidadoId != null) {
      this.store.dispatch(showPreloader({ payload: '' }));
      this.createUsuarioConvidadoForm.get('tipoUsuario').disable();

      Utility.waitFor(() => { this.carregarUsuario(); }, 1000);
    }else{
      // LIMPA CAMPOS AO EDITAR O TIPO USUARIO (INTERNO | EXTERNO)
      this.createUsuarioConvidadoForm.get('tipoUsuario').valueChanges.subscribe(() => {
        this.limparCamposAoAlterarTipoUsuario();
        this.createUsuarioConvidadoForm.get('empresaNomeConvidado').enable();
        this.createUsuarioConvidadoForm.get('empresaNomeOrigem').enable();
      });

      this.createUsuarioConvidadoForm.get('empresaIdConvidado').valueChanges.subscribe(value => {
        this.createUsuarioConvidadoForm.get('perfilId').disable();
        if (value) { // CARREGA OS PERFIS DA EMPRESA SELECIONADA
          this.carregarPerfis(value);
          return;
        }

        // SE FOR DO TIPO INTERNO, OS CAMPOS DE USUARIO SAO RESETADOS
        if (this.createUsuarioConvidadoForm.get('tipoUsuario').value == '0') {
          this.createUsuarioConvidadoForm.get('usuarioId').reset();
          this.createUsuarioConvidadoForm.get('usuarioNome').reset();
          this.createUsuarioConvidadoForm.get('usuarioNome').disable();
        }
      });
    }
  }

  private limparCamposAoAlterarTipoUsuario() {
    this.createUsuarioConvidadoForm.get('usuarioId').reset();
    this.createUsuarioConvidadoForm.get('nomeEmpresa').reset();
    this.createUsuarioConvidadoForm.get('nomeUsuario').reset();
    this.createUsuarioConvidadoForm.get('empresaIdOrigem').reset();
    this.createUsuarioConvidadoForm.get('perfilId').reset();
    this.createUsuarioConvidadoForm.get('empresaIdConvidado').reset();
    this.createUsuarioConvidadoForm.get('usuarioNome').reset();
    this.createUsuarioConvidadoForm.get('empresaNomeConvidado').reset();
    this.createUsuarioConvidadoForm.get('empresaNomeOrigem').reset();

    this.carregarEmpresasGrupo();
    this.carregarEmpresasExternas();
  }

  submitUsuario() {
    let usuarioConvidado = <ConvidarUsuarioRequest>{
      usuarioId: this.createUsuarioConvidadoForm.get('usuarioId').value,
      perfilId: this.createUsuarioConvidadoForm.get('perfilId').value,
      empresaIdOrigem: this.createUsuarioConvidadoForm.get('empresaIdOrigem').value,
      empresaIdConvidado: this.createUsuarioConvidadoForm.get('empresaIdConvidado').value,
      tipoExterno: this.createUsuarioConvidadoForm.get('tipoUsuario').value == '1'
    };

    this.store.dispatch(showPreloader({ payload: '' }))

    if (!this.usuarioConvidadoId) {
      this.criarUsuarioConvidado(usuarioConvidado);
      return;
    }

    this.editarConvidado(usuarioConvidado);
  }

  private criarUsuarioConvidado(usuarioConvidado: ConvidarUsuarioRequest) {
    let nomeUsuario = !this.usuarioConvidadoId ? this.usuarios.filter(usuario => usuario.id == this.createUsuarioConvidadoForm.get('usuarioId').value)[0].nome : this.createUsuarioConvidadoForm.get('nomeUsuario').value;
    let empresaConvidado = !this.usuarioConvidadoId ? this.empresas.filter(empresa => empresa.id == this.createUsuarioConvidadoForm.get('empresaIdConvidado').value)[0].name : this.createUsuarioConvidadoForm.get('nomeEmpresa').value;

    this.usuariosService.criarUsuarioConvidado(usuarioConvidado)
      .toPromise().then((result) => {
        if (result.errors) {
          this.notifierService.showNotification(result.errors[0].message, result.errors[0].code, 'error');
          this.store.dispatch(closePreloader())
          return;
        }

        this.store.dispatch(closePreloader())
        this.notifierService.showNotification(
          `Acesso à empresa <strong>${empresaConvidado}</strong> concedido ao usuário <strong>${nomeUsuario}</strong>!`,
          'Sucesso',
          'success'
        );
        this.store.dispatch(closePreloader())
        this.router.navigate(['../'], {
          relativeTo: this.activatedRoute,
        });
      },
      ).catch(result => {
        this.notifierService.showNotification(result.errors[0].message, result.errors[0].code, 'error');
        this.store.dispatch(closePreloader())
      });
  }

  private editarConvidado(usuarioConvidado: ConvidarUsuarioRequest) {
    this.usuariosService.atualizarUsuarioConvidado(usuarioConvidado)
      .subscribe(result => {
        if (result) {
          if (result.errors) {
            this.notifierService.showNotification(result.errors[0].message, result.errors[0].code, 'error');
            this.store.dispatch(closePreloader())
            return;
          }

          this.notifierService.showNotification(
            `Usuário editado com sucesso!`,
            'Sucesso',
            'success'
          );
          this.store.dispatch(closePreloader())
          this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
        }
      }, error => { this.store.dispatch(closePreloader()) });
  }

  carregarUsuario() {
    this.usuariosService.obterUsuarioConvidado(this.usuarioConvidadoId).subscribe(result => {
      if (result.empresaIdConvidado) {
        this.carregarPerfis(result.empresaIdConvidado);
        this.usuarioConvidadoModel = result;

        Utility.waitFor(() => {
          this.setUsuarioCarregado(result);
        }, 1000);
      }
    });
  }

  setUsuarioCarregado(result: ObterUsuarioConvidadoResponse) {    
    this.createUsuarioConvidadoForm.setValue({
      produto: '0',
      tipoUsuario: result.tipoExterno ? '1' : '0',
      usuarioId: result.usuarioId,
      nomeEmpresa: result.nomeEmpresaConvidado,
      nomeUsuario: result.nomeUsuario,

      empresaIdOrigem: result.empresaIdOrigem,
      perfilId: result.perfilId,
      usuarioNome: result.nomeUsuario + ' (' + result.email + ')',
      empresaIdConvidado: result.empresaIdConvidado,
      empresaNomeConvidado: result.nomeEmpresaConvidado,
      empresaNomeOrigem: result.nomeEmpresaOrigem + " - " + result.cnpj
    });
    
    this.createUsuarioConvidadoForm.get('perfilId').enable();
    
    this.createUsuarioConvidadoForm.get('usuarioNome').setValue(result.nomeUsuario + ' (' + result.email + ')');
    this.createUsuarioConvidadoForm.get('usuarioNome').disable();
    
    this.store.dispatch(closePreloader())
  }

  private limparCampoUsuario() {
    this.createUsuarioConvidadoForm.get('usuarioNome').reset();
    this.createUsuarioConvidadoForm.get('usuarioId').reset();
  }

  private habilitarCampoUsuario() {
    this.createUsuarioConvidadoForm.get('usuarioId').enable();
    this.createUsuarioConvidadoForm.get('usuarioNome').enable();
  }

  filtrarUsuarios(empresaId: number) {
    this.limparCampoUsuario();

    this.usuariosService.obterUsuariosGrupoEconomico(this.grupoEconomicoId, empresaId).subscribe(response => {
      this.usuarios = response.usuariosConvidados;
      this.usuariosFiltrados = this.usuarios;
      this.habilitarCampoUsuario();
    });
  }

  filtrarUsuariosExternos(nome: string = '') {
    let empresaIdOrigem = this.createUsuarioConvidadoForm.get('empresaIdOrigem').value;

    if (empresaIdOrigem == null) return;

    let filtro = new UsuarioEmpresaFiltro();
    if (nome) {
      filtro.nome = nome;
    }

    this.usuariosService.obterUsuarios(empresaIdOrigem, 0, 10, '', filtro, true).subscribe(response => {
      if (response.usuarios) {
        let usuarios: UsuariosGrupoEconomico[] = [];

        response.usuarios.forEach(usr => {
          usuarios.push(<UsuariosGrupoEconomico>{
            id: usr.id,
            email: usr.email,
            nome: usr.nomeCompleto
          })
        });

        this.usuarios = usuarios;
        this.usuariosFiltrados = this.usuarios;
        this.habilitarCampoUsuario();
      }
    });
  }

  private carregarEmpresasGrupo() {
    this.grupoEconomicoService.obterEmpresasLista(this.grupoEconomicoId).subscribe(response => {
      let empresas = response.empresas;
      this.empresas = response.empresas;
      
      empresas.forEach(empresa => {
        empresa.cnpj = Utility.formatCnpj(empresa.cnpj)
      });
      this.empresasFiltradas = empresas;
    });
  }

  carregarEmpresasExternas(filtro: string = null) {
    this.empresasService.obterEmpresasExternasFiltro(0, 10, this.grupoEconomicoId, filtro).subscribe(response => {
      let empresas = response.empresas;
      empresas.forEach(empresa => { empresa.cnpj = Utility.formatCnpj(empresa.cnpj) });

      this.empresasExternasFiltradas = empresas;
    });
  }

  carregarPerfis(empresaId: number) {
    this.createUsuarioConvidadoForm.get('perfilId').reset();
    this.usuariosService.obterPerfisConvidados(empresaId).subscribe(result => {
      this.perfis = result.perfis;
      this.createUsuarioConvidadoForm.get('perfilId').enable();
    });
  }

  getOptionEmpresa(empresa: UsuarioEmpresaGrupoEconomico) {
    return `${empresa.name} - ${Utility.formatCnpj(empresa.cnpj)}`
  }

  filterData(value: string, empresa: boolean = false) {
    if (value) {
      const valueInput = value.toLocaleLowerCase()

      if (!empresa) {
        this.usuariosFiltrados = this.usuarios?.filter((item: UsuariosGrupoEconomico) => {
          return item.nome.toLowerCase().indexOf(valueInput) > -1
        });
        return;
      }

      this.empresasFiltradas = this.empresas?.filter((item: UsuarioEmpresaGrupoEconomico) => {
        return item.name.toLowerCase().indexOf(valueInput) > -1
      });
    }
  }

  selecionaUsuarioId(interno: boolean = true) {
    let usuarioSelecionado = this.createUsuarioConvidadoForm.get('usuarioNome').value;

    if (!usuarioSelecionado) {
      this.createUsuarioConvidadoForm.get('usuarioId').reset();
      return;
    }

    let email = this.createUsuarioConvidadoForm.get('usuarioNome').value.split('(').pop().split(')')[0];

    if (!email) {
      this.createUsuarioConvidadoForm.get('usuarioId').reset();
      return;
    }

    let userEmail = this.usuarios.filter(u => u.email == email)[0];
    if (!userEmail) {
      this.createUsuarioConvidadoForm.get('usuarioId').reset();
      return;
    }

    this.createUsuarioConvidadoForm.get('usuarioId').setValue(userEmail.id);
    
    if(interno){
      this.createUsuarioConvidadoForm.get('empresaIdOrigem').setValue(userEmail.empresaId);
    }
  }

  selecionarEmpresaId(empresaExterna: boolean = false, filtrarUsuario: boolean = true) {
    if (empresaExterna) {
      let cnpjExterno = this.carregarEmpresaId('empresaNomeOrigem', 'empresaIdOrigem');
      this.selecionarEmpresaOrigemId(cnpjExterno);
      this.filtrarUsuariosExternos();
      this.createUsuarioConvidadoForm.get('usuarioNome').enable();
    }
    else {
      let cnpjInterno = this.carregarEmpresaId();
      this.selecionarEmpresaConvidadoId(cnpjInterno);
      this.createUsuarioConvidadoForm.get('usuarioNome').enable();
    }

    if (filtrarUsuario) {
      this.selecionarUsuario();
    }
  }

  private selecionarEmpresaOrigemId(cnpj: string) {
    let empresaCnpj = this.empresasExternasFiltradas.filter(e => Utility.checkNumbersOnly(e.cnpj).indexOf(Utility.checkNumbersOnly(cnpj)) > -1)[0];

    if (!empresaCnpj) {
      this.createUsuarioConvidadoForm.get('empresaIdOrigem').reset();
      return;
    }
    
    this.createUsuarioConvidadoForm.get('empresaIdOrigem').setValue(empresaCnpj.id);
    this.createUsuarioConvidadoForm.get('empresaIdOrigem').updateValueAndValidity();
  }

  private selecionarEmpresaConvidadoId(cnpj: string) {
    let empresaCnpj = this.empresas.filter(e => Utility.checkNumbersOnly(e.cnpj).indexOf(Utility.checkNumbersOnly(cnpj)) > -1)[0];

    if (!empresaCnpj) {
      this.createUsuarioConvidadoForm.get('empresaIdConvidado').reset();
      return;
    }

    if (this.createUsuarioConvidadoForm.get('empresaIdConvidado').value == empresaCnpj.id) return;

    this.createUsuarioConvidadoForm.get('empresaIdConvidado').setValue(empresaCnpj.id);
  }

  private carregarEmpresaId(empresaNome: string = 'empresaNomeConvidado', id: string = 'empresaIdConvidado'): string {
    let empresaSelecionada = this.createUsuarioConvidadoForm.get(empresaNome).value;
    if (!empresaSelecionada) {
      this.createUsuarioConvidadoForm.get(id).reset();
      return;
    }

    let empresaTxt = this.createUsuarioConvidadoForm.get(empresaNome).value.split(' - ');
    let cnpj = this.createUsuarioConvidadoForm.get(empresaNome).value.split(' - ')[empresaTxt.length - 1];

    if (!cnpj) {
      this.createUsuarioConvidadoForm.get(id).reset();
      return;
    }

    return cnpj;
  }

  private selecionarUsuario() {
    if (this.createUsuarioConvidadoForm.get('tipoUsuario').value == '1') {
      this.filtrarUsuariosExternos(this.createUsuarioConvidadoForm.get('empresaIdOrigem').value);
      return;
    }

    this.filtrarUsuarios(this.createUsuarioConvidadoForm.get('empresaIdConvidado').value);
  }
}
