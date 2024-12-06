import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Utility } from 'src/app/core/common/utility';
import { DialogCustomService } from 'src/app/shared/services/dialog-custom.service';
import { Dominios } from '../../../../../../admin/core/models/dominios/dominios.model';
import { DominioService } from '../../../../../../admin/services/dominio.service';

@Component({
  selector: 'app-liberacao-acesso',
  templateUrl: './liberacao-acesso.component.html',
  styleUrls: ['./liberacao-acesso.component.scss']
})
export class LiberacaoAcessoComponent implements OnInit {

  utility = Utility;

  liberacaoAcessoForm = this.formBuilder.group({
    solicitanteId: '',
    solicitante: '',
    descricao: '',
  });

  tipoSolicitantes: Dominios[] = [];

  constructor(private formBuilder: UntypedFormBuilder, private dialogService: DialogCustomService, private dominioService: DominioService) { }

  ngOnInit(): void {
    this.dialogService.setDialogData("nodata");
    this.getSolicitantes();

    this.liberacaoAcessoForm.get('solicitanteId').valueChanges.subscribe(s => {
      if (s !== null) { this.liberacaoAcessoForm.get('solicitante').setValue(this.tipoSolicitantes.filter(sol => sol.id === s)[0]?.valor); }
      else { this.liberacaoAcessoForm.get('solicitante').reset(); }

      if (s > 1) {
        this.liberacaoAcessoForm.get('descricao').setValidators(Validators.compose([Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]))
        this.liberacaoAcessoForm.get('descricao').updateValueAndValidity();
        return
      }
      this.liberacaoAcessoForm.get('descricao').setValidators(Validators.compose([Validators.required]))
      this.liberacaoAcessoForm.get('descricao').updateValueAndValidity();

    })

    this.liberacaoAcessoForm.statusChanges.subscribe((s) => {
      Utility.waitFor(() => {
        if (s == 'VALID') {
          this.dialogService.setDialogData({ dataType: 'liberacaoAcesso', data: this.liberacaoAcessoForm.value });
        } else {
          this.dialogService.setDialogData("nodata");
        }
      }, 1000)
    });
  }

  getSolicitantes() {
    this.dominioService.obterPorTipo('SOLICITANTE_VISUALIZACAO_DADOS_DEVEDOR_ECONTRATO').subscribe(result => {
      this.tipoSolicitantes = result.valorDominio;
    })
  }

}
