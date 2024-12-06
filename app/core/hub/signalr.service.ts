import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { MessagePackHubProtocol } from '@microsoft/signalr-protocol-msgpack';
import { Store } from '@ngrx/store';
import { AppSettings } from 'src/app/configs/app-settings.config';
import { notificarConexaoDetran } from 'src/app/shared/store/notificacoes/notificacao-conexao-detran/actions/notificacao-conexao-detran.actions';
import { INotificacaoConexaoDetran } from 'src/app/shared/store/notificacoes/notificacao-conexao-detran/notificacao-conexao-detran.model';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection!: HubConnection;

  constructor(private appSettings: AppSettings,
    private authService: AuthService,
    private store: Store<{ notificacaoConexaoDetran: INotificacaoConexaoDetran }>) {
  }

  public init() {
    this.createConnection();
    this.register();
    this.startConnection();
  }

  private createConnection(): void {

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.appSettings.endpointHub)
      .withHubProtocol(new MessagePackHubProtocol())
      .configureLogging(LogLevel.Debug)
      .build();
  }

  private register(): void {

    this.hubConnection.on('MapaDetranProcessadoNotification', (mensagem: string) => {
      this.store.dispatch(notificarConexaoDetran({
        payload: {
          mensagem: mensagem
        }
      }))
    })
  }

  private startConnection(): void {
    this.hubConnection
      .start()
      .then(() => this.addUserToGroup())
      .catch(err => console.error(err));
  }

  private async addUserToGroup(): Promise<void> {

    let user = await this.authService.obterUsuarioAtual();

    this.hubConnection
      .send('AddUserToGroup', user.id)
      .catch(err => console.error(err));
  }
}
