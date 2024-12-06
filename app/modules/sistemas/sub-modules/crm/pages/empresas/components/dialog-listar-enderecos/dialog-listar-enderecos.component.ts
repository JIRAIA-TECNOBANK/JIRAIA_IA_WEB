import { Component, Inject, OnInit } from '@angular/core';
import {
  MatLegacyDialog as MatDialog,
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
} from '@angular/material/legacy-dialog';
import { Enderecos } from '../../../../core/models/empresas/enderecos.model';
import { EnderecosResponse } from '../../../../core/responses/empresas/obter-enderecos.response';
import { EmpresasService } from '../../../../services/empresas.service';

@Component({
  selector: 'app-dialog-listar-enderecos',
  templateUrl: './dialog-listar-enderecos.component.html',
  styleUrls: ['./dialog-listar-enderecos.component.scss'],
})
export class DialogListarEnderecosComponent implements OnInit {
  listaEnderecos = [];
  empresaId: number = null;

  criarEndereco: boolean = false;
  enderecoSelecionado: any = null;

  enderecoToEdit: EnderecosResponse = null;

  constructor(
    public dialogRef: MatDialogRef<DialogListarEnderecosComponent>,
    private dialog: MatDialog,
    private empresasService: EmpresasService,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    this.listaEnderecos = this.data.listaEnderecos.enderecos;
    this.empresaId = this.data.empresaId;

  }

  concluirEndereco(value: any) {
    if (value !== null) { this.enderecoSelecionado = value; }
  }

  submitNovoEndereco(endereco: Enderecos) {
    if (endereco !== null) { this.carregarDadosEnderecos(); }
    this.criarEndereco = false;
  }

  addEndereco() {
    this.criarEndereco = true;
    this.enderecoToEdit = null;
  }

  editEndereco(enderecoId) {
    this.criarEndereco = true;
    this.enderecoToEdit = this.listaEnderecos.find(endereco => endereco.id == enderecoId);
  }

  carregarDadosEnderecos() {
    this.empresasService.obterEmpresasEndereco(this.data.empresaId).subscribe(result => {
      this.listaEnderecos = result.enderecos;
      this.listaEnderecos.sort((a,b) => {return (a.enderecoPrincipal ? 0 : 1) - (b.enderecoPrincipal ? 0 : 1)});
    });
  }

  ngOnInit(): void {
    //
   }
}
