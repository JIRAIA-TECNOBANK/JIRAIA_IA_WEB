import { Component, Input, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ArtigosListagem } from 'src/app/modules/sistemas/sub-modules/crm/core/models/central-ajuda/artigos-listagem';
import { Router } from '@angular/router';
import { CentralAjudaService } from '../../../../../services/central-ajuda.service';
import { ObterArtigosPorSecaoResponse } from '../../../../../core/responses/central-ajuda/obter-artigos-por-secao.response';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';

@Component({
  selector: 'app-listar-artigos',
  templateUrl: './listar-artigos.component.html',
  styleUrls: ['./listar-artigos.component.scss']
})
export class ListarArtigosComponent implements OnInit {

  constructor(private router: Router, private centralAjudaService: CentralAjudaService, private notifierService: NotifierService) { }

  @Input('artigos') artigos: ArtigosListagem[];

  ngOnInit(): void {
    //
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.artigos, event.previousIndex, event.currentIndex);

    for (let i = 0; i < this.artigos.length; i++) {
      this.artigos[i].posicao = i + 1;
    }

    this.atualizarPosicao();
  }

  editarArtigo(artigoId: number) {
    this.router.navigate([`/central-ajuda/editar-artigo/${artigoId}`]);
  }

  private atualizarPosicao() {
    let artigosRequest = <ObterArtigosPorSecaoResponse>{ artigos: this.artigos };
    this.centralAjudaService.alterarPosicaoArtigo(artigosRequest).subscribe(response => {
      if (response.errors?.length > 0) {
        this.notifierService.showNotification(response.errors[0].message, '', 'error');
        return;
      }
    });
  }

}
