import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyPaginatorIntl as MatPaginatorIntl, MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatSortModule } from '@angular/material/sort';

import { SharedModule } from 'src/app/shared/shared.module';
import { CustomPaginatorIntl } from '../../../../../../shared/services/custom-paginator.service';
import { DialogListarEnderecosComponent } from './components/dialog-listar-enderecos/dialog-listar-enderecos.component';
import { FormEnderecoComponent } from './components/form-endereco/form-endereco.component';
import { ListarEnderecosComponent } from './components/listar-enderecos/listar-enderecos.component';
import { ProdutoFuncionalidadeComponent } from './components/produto-funcionalidade/produto-funcionalidade.component';
import { TableEmpresasComponent } from './components/table-empresas/table-empresas.component';
import { EmpresasRoutingModule } from './empresas-routing.module';
import { CriarEmpresaComponent } from './pages/criar-empresa/criar-empresa.component';
import { CriarUsuarioMasterComponent } from './pages/criar-usuario-master/criar-usuario-master.component';
import { CriarUsuarioComponent } from './pages/criar-usuario/criar-usuario.component';
import { GestaoAcessosComponent } from './pages/gestao-acessos/gestao-acessos.component';
import { ListarEmpresasComponent } from './pages/listar-empresas/listar-empresas.component';
import { ProdutosComponent } from './pages/produtos/produtos.component';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepperModule } from '@angular/material/stepper';
import { NgxMaskModule } from 'ngx-mask';
import { FaturamentoModule } from '../../../faturamento/faturamento.module';
import { ConfigurarProdutoComponent } from './components/configurar-produto/configurar-produto.component';
import { ConsultarPrecoDetranComponent } from './components/consultar-preco-detran/consultar-preco-detran.component';
import { ConsultarPrecoPrivadoComponent } from './components/consultar-preco-privado/consultar-preco-privado.component';
import { ContatosAdicionaisComponent } from './components/contatos-adicionais/contatos-adicionais.component';
import { DadosEmpresaComponent } from './components/dados-empresa/dados-empresa.component';
import { DefinicaoSenhaComponent } from './components/definicao-senha/definicao-senha.component';
import { DialogAddressListComponent } from './components/dialog-address-list/dialog-address-list.component';
import { DialogConfirmComponent } from './components/dialog-confirm/dialog-confirm.component';
import { DialogEnviarCredenciaisComponent } from './components/dialog-enviar-credenciais/dialog-enviar-credenciais.component';
import { DialogUsuarioExistenteComponent } from './components/dialog-usuario-existente/dialog-usuario-existente.component';
import { DocumentosComponent } from './components/documentos/documentos.component';
import { EnderecosAdicionaisComponent } from './components/enderecos-adicionais/enderecos-adicionais.component';
import { EnvioEmailPendenciaComponent } from './components/envio-email-pendencia/envio-email-pendencia.component';
import { FormStepperCriarEmpresaComponent } from './components/form-stepper-criar-empresa/form-stepper-criar-empresa.component';
import { CriarPerfilComponent } from './components/gestao-acessos/perfis/criar-perfil/criar-perfil.component';
import { TablePerfisComponent } from './components/gestao-acessos/perfis/table-perfis/table-perfis.component';
import { InformacoesComplementaresComponent } from './components/informacoes-complementares/informacoes-complementares.component';
import { SelecionarProdutoComponent } from './components/selecionar-produto/selecionar-produto.component';
import { StepperButtonsComponent } from './components/stepper-buttons/stepper-buttons.component';
import { TableGruposEconomicosComponent } from './components/table-grupos-economicos/table-grupos-economicos.component';
import { TableUsuariosSrdComponent } from './components/table-usuarios-srd/table-usuarios-srd.component';
import { TableUsuariosComponent } from './components/table-usuarios/table-usuarios.component';
import { UsuarioMasterComponent } from './components/usuario-master/usuario-master.component';
import { CriarUsuarioSrdComponent } from './pages/criar-usuario-srd/criar-usuario-srd.component';

@NgModule({
    declarations: [
        ListarEmpresasComponent,
        CriarEmpresaComponent,
        FormEnderecoComponent,
        ListarEnderecosComponent,
        ProdutosComponent,
        DialogListarEnderecosComponent,
        GestaoAcessosComponent,
        CriarUsuarioComponent,
        ProdutoFuncionalidadeComponent,
        CriarUsuarioMasterComponent,
        TableEmpresasComponent,
        DialogConfirmComponent,
        TableUsuariosComponent,
        EnvioEmailPendenciaComponent,
        DefinicaoSenhaComponent,
        DialogEnviarCredenciaisComponent,
        CriarPerfilComponent,
        TablePerfisComponent,
        FormStepperCriarEmpresaComponent,
        DadosEmpresaComponent,
        SelecionarProdutoComponent,
        ConfigurarProdutoComponent,
        StepperButtonsComponent,
        ContatosAdicionaisComponent,
        EnderecosAdicionaisComponent,
        DocumentosComponent,
        UsuarioMasterComponent,
        DialogAddressListComponent,
        InformacoesComplementaresComponent,
        DialogUsuarioExistenteComponent,
        TableGruposEconomicosComponent,
        ConsultarPrecoDetranComponent,
        ConsultarPrecoPrivadoComponent,
        TableUsuariosSrdComponent,
        CriarUsuarioSrdComponent
    ],
    imports: [
        CommonModule,
        EmpresasRoutingModule,
        FlexLayoutModule,
        SharedModule,
        ReactiveFormsModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        MatCardModule,
        MatCheckboxModule,
        MatDialogModule,
        MatFormFieldModule,
        MatGridListModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatPaginatorModule,
        MatRadioModule,
        MatSelectModule,
        MatTableModule,
        MatSortModule,
        MatSlideToggleModule,
        MatTabsModule,
        MatTooltipModule,
        MatDatepickerModule,
        MatAutocompleteModule,
        MatChipsModule,
        MatExpansionModule,
        FormsModule,
        MatStepperModule,
        FaturamentoModule,
        NgxMaskModule.forChild(),
    ],
    exports: [
        TableEmpresasComponent,
        TableGruposEconomicosComponent
    ],
    providers: [
        {
            provide: MatPaginatorIntl,
            useClass: CustomPaginatorIntl,
        },
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EmpresasModule {}
