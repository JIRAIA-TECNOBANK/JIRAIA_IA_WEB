import { Injector, NgModule } from "@angular/core";
import { MAT_DATE_LOCALE } from "@angular/material/core";
import { NgxMaskModule } from "ngx-mask";
import { AppSettings } from "src/app/configs/app-settings.config";
import { AdministracaoRoutingModule } from "./administracao-routing.module";
import { GestaoDetransModule } from "./gestao-detrans/gestao-detrans.module";

@NgModule({
    declarations: [
    ],
    imports: [
        AdministracaoRoutingModule,
        GestaoDetransModule,
        NgxMaskModule.forChild(),
    ],
    exports: [
    ],
    providers: [
        AppSettings,
        {
            provide: MAT_DATE_LOCALE,
            useValue: 'pt-BR',
        },
    ],
})
export class AdministracaoModule {
    constructor(private injector: Injector) {
        appInjector = this.injector;
    }
}

export let appInjector: Injector;