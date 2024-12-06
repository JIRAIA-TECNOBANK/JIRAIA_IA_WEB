import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { DialogSimpleService } from 'src/app/shared/components/dialog-simple/dialog-simple.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { ConsultarContratoResponse } from '../../../../admin/core/responses/_portal/contrato/consultar-contrato.response';
import { ContratoService } from '../../../../admin/services/_portal/contrato.service';

@Component({
  selector: 'app-espelho-contrato',
  templateUrl: './espelho-contrato.component.html',
  styleUrls: ['./espelho-contrato.component.scss']
})
export class EspelhoContratoComponent implements OnInit {

  constructor(
    private contratoService: ContratoService,
    private activeRoute: ActivatedRoute,
    private store: Store<{ preloader: IPreloaderState }>,
    private notifierService: NotifierService,
    private title: Title,
    private dialogSimpleService: DialogSimpleService
  ) { }

  contrato: ConsultarContratoResponse;
  protocolo: string;

  ngOnInit(): void {
    this.store.dispatch(showPreloader({ payload: 'Por favor aguarde um momento, estamos processando as informações' }));

    this.activeRoute.queryParams.subscribe(params => {
      this.contrato = null;
      this.contratoService.retornoContrato(this.contrato);
      this.protocolo = params['protocolo'];
    });
  }

  ngAfterViewInit() {
    this.contratoService.consultarContratoPorProtocolo(this.protocolo).toPromise()
      .then(response => {
        this.store.dispatch(closePreloader());
        if (response.contrato) {
          this.contrato = response;
          this.contratoService.retornoContrato(this.contrato);
          return;
        }

        this.notifierService.showNotification(response.errors[0].message, 'Erro ' + response.errors[0].code, 'error');
      })
      .catch((response) => {
        this.store.dispatch(closePreloader());
        this.notifierService.showNotification(response.errors[0].message, 'Erro ' + response.errors[0].code, 'error');
      })
  }

  showTerceiroGarantidor() {
    return this.contrato?.terceiroGarantidor;
  }

  checkAriaExpanded(tab: any) {
    return tab.panel._expanded;
  }

  printPage() {
    const currentTitle = this.title.getTitle();
    this.title.setTitle('Espelho do Contrato Nº ' + this.contrato.contrato.numeroContrato);
    window.print();
    this.title.setTitle(currentTitle);
  }

  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(<TipoElemento>tipoElemento, nomeElemento, guidElemento);
  }
}
