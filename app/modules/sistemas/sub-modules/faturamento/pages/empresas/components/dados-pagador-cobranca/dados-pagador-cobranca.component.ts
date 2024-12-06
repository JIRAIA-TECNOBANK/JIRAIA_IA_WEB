import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Utility } from 'src/app/core/common/utility';
import { Empresas } from 'src/app/modules/sistemas/sub-modules/crm/core/models/empresas/empresas.model';
import { ObterEmpresasGrupoRequest } from 'src/app/modules/sistemas/sub-modules/crm/core/requests/empresas/obter-empresas-grupo.request';
import { EmpresasService } from 'src/app/modules/sistemas/sub-modules/crm/services/empresas.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { AlterarDadosCobrancaPagadorRequest } from '../../../../core/requests/empresa/alterar-dados-cobranca-pagador.response';
import { EmpresaFaturamentoService } from '../../../../services/empresa.service';

@Component({
  selector: 'app-dados-pagador-cobranca',
  templateUrl: './dados-pagador-cobranca.component.html',
  styleUrls: ['./dados-pagador-cobranca.component.scss']
})
export class DadosPagadorCobrancaComponent {

  @Input('empresaId') empresaId: number;
  @Output() nextTab: EventEmitter<boolean> = new EventEmitter<boolean>();

  utility = Utility;
  timer: NodeJS.Timeout;

  empresas: Empresas[] = null;
  empresasFiltradas: Empresas[] = [];

  empresaSelecionada: number = null;

  formulario = this.fb.group({
    empresaNome: [{ value: null, disabled: true }, Validators.required],
    empresaCnpj: [null],
    credorContrato: [true, Validators.required],
    nota: [{ value: null, disabled: true }, Validators.required],
  });

  editarCobranca: boolean = false;
  formularioAberto: boolean = true;

  constructor(private fb: UntypedFormBuilder,
    private empresaService: EmpresasService,
    private notifierService: NotifierService,
    private empresaFaturamentoService: EmpresaFaturamentoService) { }

  ngOnInit(): void {
    this.carregarEmpresas();

    this.formulario.get('credorContrato').valueChanges.subscribe(value => {
      if (value) {
        this.formulario.get('empresaNome').reset();
        this.formulario.get('nota').reset();
        this.formulario.get('empresaNome').disable();
        this.formulario.get('nota').disable();
        return;
      }

      this.formulario.get('empresaNome').enable();
      this.formulario.get('nota').enable();
    });

    this.carregarDadosCobranca();
  }

  filtrarEmpresas(filtro: string = null) {
    if (filtro) {
      if (filtro.length >= 3) {
        const value = Utility.checkNumbersOnly(filtro);
        if (value.length >= 3) {
          const listaEmpresas = this.empresas;

          if (!isNaN(+value)) {
            this.empresasFiltradas = listaEmpresas.filter(empresa => Utility.checkNumbersOnly(empresa.cnpj).startsWith(value)).slice(0, 10);
            return;
          }

          this.empresasFiltradas = listaEmpresas.filter(empresa => empresa.nomeFantasia.toLocaleLowerCase().startsWith(value)).slice(0, 10);
          return;
        }
      }
    }

    this.empresasFiltradas = this.empresas.slice(0, 10);
  }

  carregarEmpresas() {
    this.empresas = [];
    this.empresaService.obterEmpresasDoGrupo(<ObterEmpresasGrupoRequest>{ empresaId: this.empresaId }).subscribe(response => {
      if (response.isSuccessful) {
        this.empresas = response.empresas.filter(e => e.id != this.empresaId);
        this.formatarEmpresas(this.empresas);
      }
    });
  }

  selecionaEmpresaValue() {
    let empresaSelecionada = this.formulario.get('empresaNome').value;
    if (!empresaSelecionada) {
      this.formulario.get('empresaCnpj').reset();
      return;
    }

    let empresaTxt = this.formulario.get('empresaNome').value.split(' - ');
    let cnpj = this.formulario.get('empresaNome').value.split(' - ')[empresaTxt.length - 1];

    if (!cnpj) {
      this.formulario.get('empresaCnpj').reset();
      return;
    }

    let empresaCnpj = this.empresas.filter(e => Utility.checkNumbersOnly(e.cnpj).indexOf(Utility.checkNumbersOnly(cnpj)) > -1)[0];
    if (!empresaCnpj) {
      this.formulario.get('empresaCnpj').reset();
      return;
    }

    this.formulario.get('empresaCnpj').setValue(empresaCnpj.cnpj);
  }

  confirmar() {
    let request = <AlterarDadosCobrancaPagadorRequest>{
      empresaId: +this.empresaId,
      cnpj: this.formulario.get('empresaCnpj').value ? this.converterCnpjNumeroString(Utility.checkNumbersOnly(this.formulario.get('empresaCnpj').value)) : null,
      credorContrato: this.formulario.get('credorContrato').value,
      nota: this.formulario.get('nota').value
    };

    this.editarDadosCobranca(request);
  }

  private converterCnpjNumeroString(cnpj: string) {
    if (cnpj.length < 14) {
      return cnpj.toString().padStart(14, '0');
    }

    return cnpj;
  }

  private editarDadosCobranca(request: AlterarDadosCobrancaPagadorRequest) {
    this.empresaFaturamentoService.alterarDadosCobrancaPagador(request).subscribe(response => {
      if (response?.editado) {
        this.sucesso();
        return;
      }

      this.erro(response.errors[0].message);
    });
  }

  private sucesso() {
    this.editarCobranca = true;
    this.notifierService.showNotification('Dados do pagador salvos com sucesso.', null, 'success');
    this.formularioAberto = false;
    this.nextTab.emit();
  }

  private erro(mensagem: string) {
    this.notifierService.showNotification(mensagem, null, 'error');
  }

  private carregarDadosCobranca() {
    this.empresaFaturamentoService.obterDadosCobrancaPagador(this.empresaId).subscribe(response => {
      if (response.cobrancaPagador !== null) {
        this.editarCobranca = true;
        this.formulario.patchValue({
          empresaNome: response.cobrancaPagador.cnpj,
          empresaCnpj: response.cobrancaPagador.cnpj,
          credorContrato: response.cobrancaPagador.credorContrato,
          nota: response.cobrancaPagador.nota,
        });

        if (response.cobrancaPagador.cnpj) {
          Utility.watchCondition(this.timer, () => {
            if (this.empresas !== null) {
              this.filtrarEmpresas(response.cobrancaPagador.cnpj);
              if (this.empresasFiltradas.length > 0) {
                this.formulario.get('empresaNome').patchValue(this.empresasFiltradas[0].nomeFantasia + ' - ' + this.empresasFiltradas[0].cnpj)
                return true;
              }
            }
          }, 1000)
        }

        return;
      }

      this.formulario.get('vencimento').patchValue(20);
    });
  }

  private formatarEmpresas(empresas: Empresas[]) {
    let empresasLista = empresas;
    empresasLista.forEach(empresa => { empresa.cnpj = Utility.formatCnpj(empresa.cnpj) });
    this.empresasFiltradas = empresasLista.slice(0, 10);
  }
}
