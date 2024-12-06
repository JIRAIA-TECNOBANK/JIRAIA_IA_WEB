import { FormControl } from "@angular/forms";

export class RangeValidator {

    static range(min: number, max: number) {
        return (control: FormControl): { [key: string]: any } => {
            let val = Number(control.value);

            if (!Number.isNaN(val) && (val >= min && val <= max)) {
                return null;
            } else {
                return { 'range': { 'min': min, 'max': max, 'actualalue': val } };
            }
        }
    }
}