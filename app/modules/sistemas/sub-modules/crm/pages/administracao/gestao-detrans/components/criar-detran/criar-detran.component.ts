import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { Uf } from '../../../../../core/models/geograficos/uf.model';
import { GeograficoService } from '../../../../../services/geografico.service';
import { AtualizarDetranRequest } from '../../../_core/requests/gestao-detran/atualizar-detran.request';
import { GestaoDetransService } from '../../../_core/services/gestao-detrans.service';

@Component({
  selector: 'app-criar-detran',
  templateUrl: './criar-detran.component.html',
  styleUrls: ['./criar-detran.component.scss']
})
export class CriarDetranComponent implements OnInit {

  utility = Utility;
  Permissoes = Permissoes;

  @Output('confirmar') confirmar: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output('uf') uf: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private fb: UntypedFormBuilder,
    private geograficoService: GeograficoService,
    private activatedRoute: ActivatedRoute,
    private store: Store<{ preloader: IPreloaderState }>,
    private gestaoDetransService: GestaoDetransService,
    private notifierService: NotifierService,
    private router: Router) {
    this.detranId = this.activatedRoute.snapshot.params['detranId'];
  }

  detranId: number = null;
  formulario: FormGroup;
  ufs: Uf[] = [];

  secondaryTheme: NgxMaterialTimepickerTheme = {
    container: {
      bodyBackgroundColor: '#FFF',
      buttonColor: '#094e8c',
      primaryFontFamily: 'Montserrat Bold'
    },
    dial: {
      dialBackgroundColor: '#094E8C',
    },
    clockFace: {
      clockFaceBackgroundColor: '#ECEEEF',
      clockHandColor: '#094E8C',
      clockFaceTimeInactiveColor: '#99A1A7'
    }
  };

  ngOnInit(): void {
    this.carregarUFs();
    this.initializeForm();

    if (this.detranId) {
      this.store.dispatch(showPreloader({ payload: '' }));
      this.carregarDetran();
    }

    if (!Utility.getPermission([Permissoes.GESTAO_FINANCEIRO_PRECO_CADASTRAR, Permissoes.GESTAO_FINANCEIRO_APROVACAO_PRECO_TECNOBANK])) {
      Utility.modoConsulta(this.formulario);
    }
  }

  onClickConfirmar() {
    this.store.dispatch(showPreloader({ payload: '' }));

    let request: AtualizarDetranRequest = <AtualizarDetranRequest>{
      id: this.formulario.get('id').value,
      periodoInatividade: this.formulario.get('periodoInatividade').value,
      ativo: this.formulario.get('ativo').value
    };

    this.gestaoDetransService.atualizarDetran(request).subscribe(response => {
      this.store.dispatch(closePreloader());

      if (response.id) {
        this.notifierService.showNotification('DETRAN parametrizado com sucesso!', '', 'success');
        this.confirmar.emit(true);
        return;
      }

      this.notifierService.showNotification(response.errors[0].message, '', 'error');
    })
  }

  private initializeForm() {
    this.formulario = this.fb.group({
      id: null,
      periodoInatividade: [null, Validators.required],
      uf: [{ value: null, disabled: true }, Validators.required],
      ativo: true,
    });
  }

  private carregarUFs() {
    this.geograficoService.obterUfs().subscribe(response => {
      this.ufs = response.ufs;
    })
  }

  private carregarDetran() {
    this.gestaoDetransService.obterDetranPorId(this.detranId).subscribe(response => {
      this.store.dispatch(closePreloader());

      if (response.id) {
        this.formulario.patchValue({
          id: response.id,
          periodoInatividade: response.periodoInatividade,
          uf: response.uf,
          ativo: response.ativo
        });

        this.uf.emit(response.uf);
      }
    });
  }

  verificarValidadeFormulario() {
    return this.formulario?.valid;
  }
}
