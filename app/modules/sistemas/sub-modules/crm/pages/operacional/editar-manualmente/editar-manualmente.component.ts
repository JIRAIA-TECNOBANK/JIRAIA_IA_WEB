import { Component, OnInit } from '@angular/core';
import { Utility } from 'src/app/core/common/utility';
import { ContratoService } from '../../../../admin/services/_portal/contrato.service';
import { ConsultarContratoResponse } from '../../../../admin/core/responses/_portal/contrato/consultar-contrato.response';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { Store } from '@ngrx/store';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { EditarManualmenteService } from '../../../services/editar-manualmente.service';
import { debounceTime, shareReplay } from 'rxjs/operators';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from 'src/app/shared/services/breadcrumb.service';
import { FormGroup } from '@angular/forms';
import { AditivoService } from '../../../../admin/services/_portal/aditivo.service';
import { DatePipe } from '@angular/common';
import { AlterarAditivoRequest } from '../../../../admin/core/requests/_portal/aditivos/alterar-aditivo.request';
import { MetadadoContrato } from '../../../../admin/core/models/_portal/common/metadado-contrato.model';
import { Contrato } from '../../../../admin/core/models/_portal/contratos/contrato.model';
import { Veiculo } from '../../../../admin/core/models/_portal/contratos/veiculo.model';
import { Credor } from '../../../../admin/core/models/_portal/contratos/credor.model';
import { Devedor } from '../../../../admin/core/models/_portal/contratos/devedor.model';
import { Financiamento } from '../../../../admin/core/models/_portal/contratos/financiamento.model';
import { ContratoComplementar } from '../../../../admin/core/models/_portal/contratos/contrato-complementar.model';
import { TipoCanal } from 'src/app/modules/sistemas/core/enums/tipo-canal.enum';

@Component({
  selector: 'app-editar-manualmente',
  templateUrl: './editar-manualmente.component.html',
  styleUrls: ['./editar-manualmente.component.scss']
})
export class EditarManualmenteComponent implements OnInit {

  constructor(private contratoService: ContratoService,
    private store: Store<{ preloader: IPreloaderState }>,
    private editarManualmenteService: EditarManualmenteService,
    private notifierService: NotifierService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private aditivoService: AditivoService) { }

  utility = Utility;
  contrato: ConsultarContratoResponse = null;
  protocolos: string[] = [];
  posicaoProtocolo: number = 0;
  habilitaBtn: boolean = false;

  pipe = new DatePipe('en-US');

  ngOnInit(): void {
    this.editarManualmenteService.protocolos$.pipe(shareReplay(), debounceTime(500)).subscribe(protocolos => {
      if (protocolos.length > 0) {
        this.carregarProtocolos(protocolos);
        return;
      }

      this.voltar();
    });
  }

  carregarProtocolos(protocolos: string[]) {
    this.protocolos = protocolos;
    this.obterContratoPorProtocolo(protocolos[this.posicaoProtocolo]);
  }

  async onClickProximo() {
    if (!this.habilitaBtn) return;

    if (await this.enviarContrato()) {
      this.posicaoProtocolo++;
      this.contrato = null;
      this.obterContratoPorProtocolo(this.protocolos[this.posicaoProtocolo]);
    }
  }

  async onClickFinalizar() {
    if (!this.habilitaBtn) return;
    if (await this.enviarContrato()) this.voltar();
  }

  habilitaProximoFinalizar(form: FormGroup) {
    this.habilitaBtn = form.valid;

    this.contrato.contrato.numeroAditivo = form.get('numeroAditivo').value;
    this.contrato.contrato.dataAditivo = this.pipe.transform(form.get('dataAditivo').value, 'dd/mm/yyyy');
    this.contrato.credor.agenteFinanceiro = this.contrato.credor.empresaId;
  }

  private obterContratoPorProtocolo(protocolo: string) {
    this.store.dispatch(showPreloader({ payload: '' }));
    this.contratoService.consultarContratoPorProtocoloBackoffice(protocolo).subscribe(result => {
      this.contrato = result;
      let identificacao = this.contrato.veiculo.length > 1 ? `CONTRATO ${this.contrato.contrato.numeroContrato}` : `CHASSI ${this.contrato.veiculo[0].chassi}`;
      this.breadcrumbService.carregarPaginaTitulo(`Editando manualmente ${this.posicaoProtocolo + 1} de ${this.protocolos.length} - ${identificacao}`);

      this.store.dispatch(closePreloader());
    });
  }

  private async enviarContrato(): Promise<boolean> {
    this.store.dispatch(showPreloader({ payload: '' }));
    let alterarAditivo = this.montarAlterarAditivoRequest();

    return await this.aditivoService.alterarAditivo(alterarAditivo).toPromise().then(result => {
      if (result.isSuccessful) {
        this.notifierService.showNotification(
          `Operação ${this.posicaoProtocolo + 1} de ${this.protocolos.length} foi editada e reenviada.`,
          'Sucesso',
          'success'
        );

        this.store.dispatch(closePreloader());
        return true;
      }

      this.notifierService.showNotification(result.errors[0].message, 'Erro', 'error');
      this.store.dispatch(closePreloader());
      return false;
    });
  }

  private montarAlterarAditivoRequest() {
    let veiculos = [];

    for (let i = 0; i < this.contrato.veiculo.length; i++) {
      veiculos.push(<Veiculo>{
        chassi: this.contrato.veiculo[i].chassi,
        placa: this.contrato.veiculo[i].placa,
        ufPlaca: this.contrato.veiculo[i].ufPlaca,
        anoFabricacao: this.contrato.veiculo[i].anoFabricacao,
        anoModelo: this.contrato.veiculo[i].anoModelo,
        renavam: this.contrato.veiculo[i].renavam,
        numeroRestricao: this.contrato.veiculo[i].numeroRestricao,
        marca: this.contrato.veiculo[i].marca,
        modelo: this.contrato.veiculo[i].modelo,
        emplacado: this.contrato.veiculo[i].emplacado,
        remarcado: this.contrato.veiculo[i].remarcado,
        especie: this.contrato.veiculo[i].especie,
        cor: this.contrato.veiculo[i].cor
      })
    }

    return <AlterarAditivoRequest>{
      metadadoContrato: <MetadadoContrato>{
        canalServico: TipoCanal.Portal
      },
      contrato: <Contrato>{
        taxaDetran: this.contrato.contrato.taxaDetran.numero ? this.contrato.contrato.taxaDetran : null,
        numeroContrato: this.contrato.contrato.numeroContrato,
        tipoRestricao: this.contrato.contrato.tipoRestricao,
        numeroRestricao: this.contrato.contrato.numeroRestricao,
        ufLicenciamento: this.contrato.contrato.ufLicenciamento,
        dataContrato: this.contrato.contrato.dataContrato,
        numeroAditivo: this.contrato.contrato.numeroAditivo,
        dataAditivo: this.contrato.contrato.dataAditivo,
        tipoAditivo: this.contrato.contrato.tipoAditivo,
        ehFrota: this.contrato.veiculo.length > 1
      },
      veiculo: <Veiculo[]>veiculos,
      credor: <Credor>this.contrato.credor,
      devedor: <Devedor>this.contrato.devedor,
      financiamento: <Financiamento>this.contrato.financiamento,
      complementar: <ContratoComplementar>{
        documentoRecebedor: this.contrato.complementar.documentoRecebedor.numero ? this.contrato.complementar.documentoRecebedor : null,
        documentoVendedor: this.contrato.complementar.documentoVendedor.numero ? this.contrato.complementar.documentoVendedor : null,
        taxaContrato: this.contrato.complementar.taxaContrato,
        taxaIof: this.contrato.complementar.taxaIof,
        indice: this.contrato.complementar.indice,
        indicadorTaxaMora: this.contrato.complementar.indicadorTaxaMora,
        valorTaxaMora: this.contrato.complementar.valorTaxaMora,
        indicadorTaxaMulta: this.contrato.complementar.indicadorTaxaMulta,
        valorTaxaMulta: this.contrato.complementar.valorTaxaMulta,
        taxaJurosMes: this.contrato.complementar.taxaJurosMes,
        taxaJurosAno: this.contrato.complementar.taxaJurosAno,
        indicadorComissao: this.contrato.complementar.indicadorComissao,
        comissao: this.contrato.complementar.comissao,
        indicadorPenalidade: this.contrato.complementar.indicadorPenalidade,
        penalidade: this.contrato.complementar.penalidade,
        nomeRecebedorPagamento: this.contrato.complementar.nomeRecebedorPagamento,
        comentario: this.contrato.complementar.comentario
      },
      terceiroGarantidor: this.contrato.terceiroGarantidor
    };
  }

  private voltar() {
    this.router.navigate([`../`], { relativeTo: this.activatedRoute });
  }
}
