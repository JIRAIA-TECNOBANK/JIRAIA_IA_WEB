import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Utility } from 'src/app/core/common/utility';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { CriarConfigImagemRequest } from '../../../../core/requests/configuracoes/criar-config-imagem.request';
import { ConfiguracoesService } from '../../../../services/configuracoes.service';
import { DominioService } from '../../../../services/dominio.service';

@Component({
  selector: 'app-registrar-detran-imagem',
  templateUrl: './registrar-detran-imagem.component.html',
  styleUrls: ['./registrar-detran-imagem.component.scss']
})
export class RegistrarDetranImagemComponent implements OnInit {
  detrans = [];
  init: boolean = false;
  imagemId: number = null;
  editDetranID;
  editDetranUF
  dadosImagem;
  isEditLoaded: boolean= false;

  createImagemForm = this.formBuilder.group({
    detran: null,
    tamanhoPorArquivoTBK: ['', Validators.max(10)],
    tipoDoArquivoTBK:[ {value: [],  disabled:true}, [Validators.required]],
    envioDetran: false,
    converterExtensaoTBK: false,
    converterTamanhoTBK: false,
    tamanhoPorArquivoDetran:[ {value:'', disabled:true}, [Validators.max(10)]],
    tipoDoArquivoDetran: [{value:[], disabled:true}, [Validators.required]],
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private notifierService: NotifierService,
    private activatedRoute: ActivatedRoute,
    private store: Store<{ preloader: IPreloaderState }>,
    private configuracoesService: ConfiguracoesService,
    private dominioService: DominioService,
  ) {
    this.imagemId = this.activatedRoute.snapshot.params['imagemId'];
  }

  ngOnInit(): void {
    this.carregaDetrans();
    this.createImagemForm.get('tipoDoArquivoTBK').enable();

      this.createImagemForm.get('converterTamanhoTBK').valueChanges.subscribe( res => {
        if(res) {
          this.createImagemForm.get('tamanhoPorArquivoDetran').enable();
        } else {
          this.createImagemForm.get('tamanhoPorArquivoDetran').setValue(null);
          this.createImagemForm.get('tamanhoPorArquivoDetran').disable();
        }
      })

      this.createImagemForm.get('converterExtensaoTBK').valueChanges.subscribe( res => {
        if(res) {
          this.createImagemForm.get('tipoDoArquivoDetran').enable();
        } else {
          this.createImagemForm.get('tipoDoArquivoDetran').setValue([]);
          this.createImagemForm.get('tipoDoArquivoDetran').disable();
        }
      })

      if(this.imagemId) {
        this.carregaDadosImagem();
      }
  }

  ngAfterViewInit() {
    this.init = true;
  }

  carregaDetrans() {
    this.configuracoesService.obterDetrans().subscribe(result => {
      if(result.isSuccessful) {
        this.detrans = result.detrans;
      }
    })
  }


  submit() {
    let imagem = <CriarConfigImagemRequest>{
      dominioId: this.createImagemForm.get('detran').value,
      tamanhoArquivoTbk: ~~this.createImagemForm.get('tamanhoPorArquivoTBK').value,
      envioDetran: this.createImagemForm.get('envioDetran').value,
      converteExtensao: this.createImagemForm.get('converterExtensaoTBK').value,
      converteTamanho: this.createImagemForm.get('converterTamanhoTBK').value,
      tamanhoArquivoDetran: ~~this.createImagemForm.get('tamanhoPorArquivoDetran').value,
      tipoArquivoDetran: this.createImagemForm.get('tipoDoArquivoDetran').value,
      tipoArquivoTbk: this.createImagemForm.get('tipoDoArquivoTBK').value,
    };

    this.store.dispatch(showPreloader({ payload: '' }))

    if(!this.imagemId) {
      this.configuracoesService.criarConfigImagem(imagem)
      .subscribe(result => {
        if (!result.isSuccessful) {
          this.notifierService.showNotification(result.errors[0].message ? result.errors[0].message : 'Houve um erro' , '', 'error');
          this.store.dispatch(closePreloader())
          return;
        }
        this.store.dispatch(closePreloader());
        this.notifierService.showNotification('Imagem criada com sucesso.' , '', 'success');
        this.router.navigate(['../configuracoes/e-contrato/configuracoes-imagens/', {relativeTo: this.activatedRoute}]);

      },
        error => { this.store.dispatch(closePreloader()) }
      );
      return;
    }

    this.configuracoesService.atualizarImagem(this.imagemId, imagem).subscribe( result => {
      if (!result.isSuccessful) {
        this.notifierService.showNotification(result.errors[0].message ? result.errors[0].message : 'Houve um erro' , '', 'error');
        this.store.dispatch(closePreloader())
        return;
      }

      this.store.dispatch(closePreloader());
      this.notifierService.showNotification('Alterações realizadas com sucesso.' , '', 'success');
      this.router.navigate(['../configuracoes/e-contrato/configuracoes-imagens/', {relativeTo: this.activatedRoute}]);
    })

  }

  carregaDadosImagem() {
    this.configuracoesService.obterImagemPorId(this.imagemId).subscribe( result => {
      this.dadosImagem = result;

      this.createImagemForm.setValue({
        detran: result.dominioId,
        tamanhoPorArquivoTBK: result.tamanhoArquivoTbk,
        tamanhoPorArquivoDetran: result.tamanhoArquivoDetran,
        tipoDoArquivoTBK: result.tipoArquivoTbk.length > 0 ? result.tipoArquivoTbk : [],
        tipoDoArquivoDetran: result.tipoArquivoDetran.length > 0 ? result.tipoArquivoDetran : [],
        envioDetran: result.envioDetran,
        converterExtensaoTBK: result.converteExtensao,
        converterTamanhoTBK: result.converteTamanho,
      })

      let allDetrans;

      this.dominioService.obterPorTipo('UF_DETRAN').subscribe(result => {
        allDetrans = result.valorDominio;
        this.editDetranUF = allDetrans.filter( detran => detran.id == this.dadosImagem.dominioId ).map(d => d.valor);
        this.editDetranID = this.dadosImagem.dominioId;
        this.isEditLoaded = true;
      });




    })
  }

  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(tipoElemento, nomeElemento, guidElemento);
  }

  getUf() {
    return this.detrans.find( detran => detran.id == this.dadosImagem.dominioId );
  }

}
