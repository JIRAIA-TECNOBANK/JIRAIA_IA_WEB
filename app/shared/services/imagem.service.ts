import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { filter } from "rxjs/operators";
import { IImagemService } from "./interfaces/imagem.service";

@Injectable()
export class ImagemService implements IImagemService {

    constructor() { }

    private _imageData: BehaviorSubject<any> = new BehaviorSubject(null);
    public imageData$ = this._imageData.asObservable().pipe(filter(imageData => !!imageData));

    /**
     * 
     * @param imageData (Retorno da Imagem, para limpar, envie como 'nodata')
     */
    setImageData(imageData: any): void { this._imageData.next(imageData); }
}