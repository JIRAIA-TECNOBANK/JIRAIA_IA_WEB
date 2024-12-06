import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexModule } from "@angular/flex-layout";
import { HeaderComponent } from './components/header/header.component';
import { MenuComponent } from './components/menu/menu.component';

import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MAT_LEGACY_SNACK_BAR_DEFAULT_OPTIONS as MAT_SNACK_BAR_DEFAULT_OPTIONS, MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from "@angular/material/legacy-autocomplete";
import { MatLegacyCardModule as MatCardModule } from "@angular/material/legacy-card";
import { MatLegacyCheckboxModule as MatCheckboxModule } from "@angular/material/legacy-checkbox";
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { MatLegacyRadioModule as MatRadioModule } from "@angular/material/legacy-radio";
import { MatLegacySelectModule as MatSelectModule } from "@angular/material/legacy-select";
import { MatLegacyTooltipModule as MatTooltipModule } from "@angular/material/legacy-tooltip";
import { RouterModule } from "@angular/router";
import { StoreModule } from "@ngrx/store";
import { NgxMaskModule } from "ngx-mask";
import { BreadcrumbModule } from "xng-breadcrumb";
import { AlertComponent } from './components/alert/alert.component';
import { AtualizarPaginaComponent } from './components/atualizar-pagina/atualizar-pagina.component';
import { BlocoInformacoesComponent } from "./components/bloco-informacoes/bloco-informacoes.component";
import { BlocoVazioComponent } from './components/bloco-vazio/bloco-vazio.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { DialogAlertaConteudoComponent } from './components/dialog-alerta-conteudo/dialog-alerta-conteudo.component';
import { DialogCustomComponent } from './components/dialog-custom/dialog-custom.component';
import { DialogEnviarEmailComponent } from './components/dialog-enviar-email/dialog-enviar-email.component';
import { DialogProfileComponent } from './components/dialog-profile/dialog-profile.component';
import { DialogSimpleComponent } from './components/dialog-simple/dialog-simple.component';
import { DialogSimpleService } from "./components/dialog-simple/dialog-simple.service";
import { FilterFieldDatepickerComponent } from "./components/filter-field-datepicker/filter-field-datepicker.component";
import { FilterFieldComponent } from './components/filter-field/filter-field.component';
import { FooterComponent } from './components/footer/footer.component';
import { GridFilterComponent } from './components/grid-filter/grid-filter.component';
import { InfoLoadingComponent } from './components/info-loading/info-loading.component';
import { LiberarAcessosComponent } from './components/liberar-acessos/liberar-acessos.component';
import { MenuItemsComponent } from './components/menu/menu-items/menu-items.component';
import { NotificacaoComponent } from './components/notificacao/notificacao.component';
import { NotifierComponent } from './components/notifier/notifier.component';
import { NotifierService } from "./components/notifier/notifier.service";
import { PermissionDeniedComponent } from "./components/permission-denied/permission-denied.component";
import { PreloaderComponent } from './components/preloader/preloader.component';
import { SendFilesComponent } from './components/send-files/send-files.component';
import { SendImageComponent } from './components/send-image/send-image.component';
import { SkeletonGridComponent } from './components/skeleton-grid/skeleton-grid.component';
import { SkeletonRectComponent } from './components/skeleton-rect/skeleton-rect.component';
import { AlphanumericsOnlyDirective } from './directives/alphanumerics-only.directive';
import { AttributeDirective } from './directives/attribute.directive';
import { DragAndDropDirective } from './directives/drag-and-drop.directive';
import { LoadingSkeletonDirective } from './directives/loading-skeleton.directive';
import { NonSpecialCharDirective } from "./directives/non-special-char.directive";
import { NumbersOnlyDirective } from "./directives/numbers-only.directive";
import { PercentageDirective } from './directives/percentage.directive';
import { JsonBeautifyPipe } from './pipes/json-beautify.pipe';
import { NoSanitizePipe } from "./pipes/no-sanitize.pipe";
import { PhoneFormatPipe } from './pipes/phone-format.pipe';
import { SortByPipe } from "./pipes/sort-by.pipe";
import { XmlBeautifyPipe } from './pipes/xml-beautify.pipe';
import { DialogCustomService } from "./services/dialog-custom.service";
import { ImagemService } from "./services/imagem.service";
import { MenuService } from "./services/menu.service";
import { infoLoadingReducer } from "./store/info-loading/info-loading.reducer";
import { notificacaoConexaoDetranReducer } from "./store/notificacoes/notificacao-conexao-detran/notificacao-conexao-detran.reducer";
import { preloaderReducer } from "./store/preloader/preloader.reducer";
import { ButtonComponent } from './widgets/button/button.component';
import { IconeFalhaComponent } from './widgets/icone-falha/icone-falha.component';
import { IconeSucessoComponent } from './widgets/icone-sucesso/icone-sucesso.component';

@NgModule({
    declarations: [
        MenuComponent,
        HeaderComponent,
        NotificacaoComponent,
        DialogProfileComponent,
        FooterComponent,
        BreadcrumbComponent,
        PreloaderComponent,
        NotifierComponent,
        InfoLoadingComponent,
        DialogSimpleComponent,
        IconeFalhaComponent,
        IconeSucessoComponent,
        ButtonComponent,
        NumbersOnlyDirective,
        AlphanumericsOnlyDirective,
        AttributeDirective,
        DragAndDropDirective,
        LoadingSkeletonDirective,
        PercentageDirective,
        NonSpecialCharDirective,
        SkeletonRectComponent,
        MenuItemsComponent,
        SortByPipe,
        SendImageComponent,
        SendFilesComponent,
        DialogCustomComponent,
        GridFilterComponent,
        FilterFieldComponent,
        PermissionDeniedComponent,
        PhoneFormatPipe,
        NoSanitizePipe,
        SkeletonGridComponent,
        AtualizarPaginaComponent,
        LiberarAcessosComponent,
        BlocoVazioComponent,
        BlocoInformacoesComponent,
        FilterFieldDatepickerComponent,
        DialogEnviarEmailComponent,
        DialogAlertaConteudoComponent,
        XmlBeautifyPipe,
        JsonBeautifyPipe,
        AlertComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        BreadcrumbModule,
        FlexModule,
        FormsModule,
        ReactiveFormsModule,
        MatMenuModule,
        MatIconModule,
        MatSnackBarModule,
        MatButtonModule,
        MatBadgeModule,
        MatProgressSpinnerModule,
        MatListModule,
        MatFormFieldModule,
        FormsModule,
        MatInputModule,
        MatDialogModule,
        MatCardModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatInputModule,
        MatSelectModule,
        MatNativeDateModule,
        MatDatepickerModule,
        MatAutocompleteModule,
        MatRadioModule,
        MatTooltipModule,
        MatChipsModule,
        StoreModule.forFeature('infoLoading', infoLoadingReducer),
        StoreModule.forFeature('preloader', preloaderReducer),
        StoreModule.forFeature('notificacaoConexaoDetran', notificacaoConexaoDetranReducer),
        NgxMaskModule.forChild()
    ],
    exports: [
        MenuComponent,
        HeaderComponent,
        NotificacaoComponent,
        FooterComponent,
        BreadcrumbComponent,
        PreloaderComponent,
        InfoLoadingComponent,
        IconeFalhaComponent,
        IconeSucessoComponent,
        ButtonComponent,
        NumbersOnlyDirective,
        AlphanumericsOnlyDirective,
        AttributeDirective,
        DragAndDropDirective,
        LoadingSkeletonDirective,
        PercentageDirective,
        NonSpecialCharDirective,
        SortByPipe,
        SendImageComponent,
        SendFilesComponent,
        DialogCustomComponent,
        GridFilterComponent,
        FilterFieldComponent,
        PermissionDeniedComponent,
        PhoneFormatPipe,
        NoSanitizePipe,
        SkeletonGridComponent,
        AtualizarPaginaComponent,
        LiberarAcessosComponent,
        BlocoVazioComponent,
        BlocoInformacoesComponent,
        XmlBeautifyPipe,
        JsonBeautifyPipe,
        AlertComponent
    ],
    providers: [
        NotifierService,
        DialogSimpleService,
        MenuService,
        ImagemService,
        DialogCustomService,
        {
            provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
            useValue: {
                duration: 10000,
                horizontalPosition: 'right',
                verticalPosition: 'top'
            }
        }
    ]
})
export class SharedModule { }
