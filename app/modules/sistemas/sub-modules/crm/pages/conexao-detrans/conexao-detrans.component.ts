import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { SortByPipe } from 'src/app/shared/pipes/sort-by.pipe';
import { INotificacaoConexaoDetran } from 'src/app/shared/store/notificacoes/notificacao-conexao-detran/notificacao-conexao-detran.model';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { ConexaoDetrans } from '../../core/models/conexao-detrans/conexao-detrans.model';
import { NotificacoesService } from '../../services/notificacoes.service';

@Component({
  selector: 'app-conexao-detrans',
  templateUrl: './conexao-detrans.component.html',
  styleUrls: ['./conexao-detrans.component.scss']
})
export class ConexaoDetransComponent implements OnInit {

  constructor(
    private notificacoesService: NotificacoesService,
    private store: Store<{ notificacaoConexaoDetran: INotificacaoConexaoDetran, preloader: IPreloaderState }>
  ) { }

  notificacaoConexaoDetran$ = this.store.select('notificacaoConexaoDetran')
    .pipe(map(notification => {
      if (notification.mensagem) {
        let retorno = JSON.parse(notification.mensagem) as ConexaoDetrans;
        this.conexoes = retorno;
        this.sortUFs();
      }
    }))

  conexoes: ConexaoDetrans;

  loading: boolean = true;

  sortPipe = new SortByPipe();

  ngOnInit(): void {
    this.carregaMapaDetrans();
  }

  sortUFs() {
    let sortedDetrans = this.sortPipe.transform(this.conexoes.detrans.filter(d => d), 'asc', 'uf');
    this.conexoes.detrans = sortedDetrans;
  }

  carregaMapaDetrans() {
    this.store.dispatch(showPreloader({payload: ''}));
    this.notificacoesService.obterMapaDetrans().subscribe((result) => {
      if (result.detrans) {
        this.conexoes = result;
        this.sortUFs();
        this.store.dispatch(closePreloader())
      }
    })
  }
}
