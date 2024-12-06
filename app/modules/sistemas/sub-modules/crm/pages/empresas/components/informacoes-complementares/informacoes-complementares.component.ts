import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatLegacyOption as MatOption } from '@angular/material/legacy-core';
import { Dominios } from '../../../../core/models/dominios/dominios.model';
import { AtualizarVersaoLotesRequest } from '../../../../core/requests/empresas/atualizar-versao-lotes.request';
import { EmpresasService } from '../../../../services/empresas.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { DominioService } from '../../../../services/dominio.service';
import { Permissoes } from 'src/app/core/common/permissoes';
import { Utility } from 'src/app/core/common/utility';

@Component({
  selector: 'app-informacoes-complementares',
  templateUrl: './informacoes-complementares.component.html',
  styleUrls: ['./informacoes-complementares.component.scss'],
})
export class InformacoesComplementaresComponent implements OnInit {
  @ViewChild('allSelectedOptions') private allSelectedOptions: MatOption;
  @Output() nextTab: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input('companyId') companyId: any;

  configLotesForm = this.formBuilder.group({
    tipoLote: [[]],
  });

  utility = Utility;
  Permissoes = Permissoes;

  versoesLote: Dominios[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: UntypedFormBuilder,
    private empresasService: EmpresasService,
    private notifierService: NotifierService,
    private dominioService: DominioService
  ) {
    if (this.activatedRoute.snapshot.params['empresaId'] != undefined) {
      this.companyId = this.activatedRoute.snapshot.params['empresaId'];
    }
  }

  ngOnInit(): void {
    this.carregarVersoesLote();

    if (!Utility.getPermission([Permissoes.GESTAO_EMPRESA_CADASTRAR])) {
      Utility.modoConsulta(this.configLotesForm);
    }
  }

  carregarVersoesLote() {
    this.dominioService.obterPorTipo('VERSOES_LOTE').subscribe((response) => {
      this.versoesLote = response.valorDominio;
      this.carregarLoteEmpresa();
    });
  }

  carregarLoteEmpresa() {
    this.empresasService.obterEmpresa(this.companyId).subscribe((response) => {
      if (response.versoesLote.length > 0) {
        if (this.versoesLote.length == response.versoesLote.length) {
          this.allSelectedOptions.select();
          this.toggleAllSelection();
        } else {
          this.configLotesForm
            .get('tipoLote')
            .patchValue(response.versoesLote.map((v) => v.dominioId));
        }
      }
    });
  }

  confirmarLotes() {
    var request = <AtualizarVersaoLotesRequest>{
      versoesLoteUtilizado: this.configLotesForm
        .get('tipoLote')
        .value.filter((lote) => lote != 'todos'),
    };
    if (this.companyId) {
      this.empresasService
        .atualizarVersoesLote(this.companyId, request)
        .subscribe((response) => {
          if (response.empresaId) {
            this.notifierService.showNotification(
              'Versões atualizadas com sucesso.',
              '',
              'success'
            );
            return;
          }

          this.notifierService.showNotification(
            response.errors[0].message,
            '',
            'error'
          );
        });
    }
    if (this.activatedRoute.snapshot.params['empresaId'] != undefined) {
      this.nextTab.emit();
    } else {
      this.router.navigate([`../../../`], { relativeTo: this.activatedRoute });
    }
  }

  togglePerOne() {
    if (this.allSelectedOptions.selected) {
      this.allSelectedOptions.deselect();
      return false;
    }
    if (
      this.configLotesForm.controls.tipoLote.value.length ==
      this.versoesLote.length
    )
      this.allSelectedOptions.select();
  }

  toggleAllSelection() {
    if (this.allSelectedOptions.selected) {
      this.configLotesForm.controls.tipoLote.patchValue([
        ...this.versoesLote.map((item) => item.id),
        'todos',
      ]);
    } else {
      this.configLotesForm.controls.tipoLote.patchValue([]);
    }
  }
}
