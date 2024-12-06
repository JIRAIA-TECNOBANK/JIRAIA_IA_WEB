import { FormGroup } from "@angular/forms";

export interface IForm {

    formulario: FormGroup;    
    initializeForm(): void;
    loadDataForm(): void;
    submit(): void;
}