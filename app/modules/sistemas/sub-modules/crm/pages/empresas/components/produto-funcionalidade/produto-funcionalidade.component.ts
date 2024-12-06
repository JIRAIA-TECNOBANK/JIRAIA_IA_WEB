import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { _oldGrupoPermissoes } from '../../../../core/models/grupo-permissoes/_old/grupo-permissoes.model';
import { GrupoPermissoesService } from '../../../../services/grupo-permissoes.service';
import { PerfisService } from '../../../../services/perfis.service';

@Component({
  selector: 'app-produto-funcionalidade',
  templateUrl: './produto-funcionalidade.component.html',
  styleUrls: ['./produto-funcionalidade.component.scss'],
})
export class ProdutoFuncionalidadeComponent implements OnInit {
  @Input() produto: any;

  showFuncionalidade: boolean = false;
  isActive: boolean = true;
  perfilId: number;

  constructor(
    private grupoPermissoesService: GrupoPermissoesService,
    private perfisService: PerfisService,
    private activatedRoute: ActivatedRoute,
    private store: Store<{ preloader: IPreloaderState }>
  ) {
    this.perfilId = this.activatedRoute.snapshot.params['perfilId'];
  }

  categoria: string;
  permissoes: _oldGrupoPermissoes[] = [];
  allSelected: boolean = false;
  items$: Observable<_oldGrupoPermissoes[]>;
  totalItems = 0;
  refresh$ = new Subject();
  pipe = new DatePipe('en-US');
  permissoesRegistradas: _oldGrupoPermissoes[] = [];

  readonly isLoadingResults$ = new BehaviorSubject(true);

  ngOnInit(): void {
  }

  ngAfterViewInit() {
  }

  getSetAll() {
    return this.permissoesRegistradas[0]?.acoes.length == this.permissoes[0]?.acoes.length;
  }

  getIndeterminate() {
    return this.permissoesRegistradas[0]?.acoes.length > 0 && this.permissoesRegistradas[0]?.acoes.length < this.permissoes[0]?.acoes.length;
  }

  checkPermissao(permissaoId: number) {
    if (this.permissoesRegistradas.length == 0) {
      return false;
    }

    return this.permissoesRegistradas[0]?.acoes.filter((res) => res.id == permissaoId).length > 0

  }

  editarFuncionalidades(categoria: string) {
    this.showFuncionalidade = true;
  }

  checkFuncionalidade(checked: boolean, funcionalidadeId: number) {
    this.store.dispatch(showPreloader({ payload: '' }));
    if (checked) {
      if (this.permissoesRegistradas[0]?.acoes.filter((acao) => acao.id == funcionalidadeId).length > 0) {
        return;
      }
      this.perfisService._oldInserirPermissao(this.perfilId, funcionalidadeId).toPromise()
        .then(result => {
        })
        .catch((e) => {
          console.info(e);
        });
    } else {
      if (this.permissoesRegistradas[0]?.acoes.filter((acao) => acao.id == funcionalidadeId).length == 0) {
        return;
      }
      this.perfisService._oldRemoverPermissao(this.perfilId, funcionalidadeId).toPromise()
        .then(result => {
        })
        .catch((e) => {
          console.info(e);
        });
    }
  }

  setAll(selecionada: boolean) {
    this.store.dispatch(showPreloader({ payload: '' }));
    this.permissoes[0]?.acoes.forEach((acao) => {
      this.checkFuncionalidade(selecionada, acao.id);

    })
  }

  fecharFuncionalidades() {
    this.showFuncionalidade = false;
  }

  concluirFuncionalidades() {
    this.fecharFuncionalidades();
  }
}
