import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Utility } from 'src/app/core/common/utility';

@Component({
  selector: 'app-selecao-regulamentos',
  templateUrl: './selecao-regulamentos.component.html',
  styleUrls: ['./selecao-regulamentos.component.scss']
})
export class SelecaoRegulamentosComponent {
  utility = Utility;
  
  @Input() layoutAlternativo: boolean = false
  @Input() totalRegistrosEstadual: number = 0;
  @Input() totalRegistrosNacional: number = 0;
  @Input() opcaoSelecionada: number = 0;
  
  @Output() optionChangeEstadualEvent: EventEmitter<number> = new EventEmitter();
  @Output() optionChangeNacionalEvent: EventEmitter<number> = new EventEmitter();
  
  @Output() pageChangeEstadualEvent: EventEmitter<PageEvent> = new EventEmitter();
  @Output() pageChangeNacionalEvent: EventEmitter<PageEvent> = new EventEmitter();
  
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private cdr: ChangeDetectorRef,) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.totalRegistrosEstadual && !changes.totalRegistrosEstadual.firstChange) {
      if (this.totalRegistrosEstadual) {
        const pageEvent: PageEvent = {
          pageIndex: 0,
          pageSize: 5,
          length: this.totalRegistrosEstadual,
        };
        this.syncPaginatorEstadual(pageEvent);
      }
    }
  }


  onOptionChangeEstadual(opcao: number) {
    if (this.opcaoSelecionada == opcao) {
      return;
    }

    this.opcaoSelecionada = opcao;
    this.optionChangeEstadualEvent.emit(opcao);

    const pageEvent: PageEvent = {
      pageIndex: 0,
      pageSize: 5,
      length: this.totalRegistrosEstadual,
    };

    this.syncPaginatorEstadual(pageEvent);

    this.pageChangeEstadualEvent.emit(pageEvent);
  }

  syncPaginatorEstadual(pageEvent: PageEvent) {
    this.paginator.pageIndex = pageEvent.pageIndex;
    this.paginator.pageSize = pageEvent.pageSize;
    this.pageChangeEstadualEvent.emit(pageEvent)
    this.cdr.detectChanges();
  }


  onOptionChangeNacional(opcao: number) {
    if (this.opcaoSelecionada == opcao) {
      return;
    }

    this.opcaoSelecionada = opcao;
    this.optionChangeNacionalEvent.emit(opcao);

    const pageEvent: PageEvent = {
      pageIndex: 0,
      pageSize: 5,
      length: this.totalRegistrosNacional,
    };

    this.syncPaginatorNacional(pageEvent);

    this.pageChangeNacionalEvent.emit(pageEvent);
  }

  syncPaginatorNacional(pageEvent: PageEvent) {
    this.paginator.pageIndex = pageEvent.pageIndex;
    this.paginator.pageSize = pageEvent.pageSize;
    this.pageChangeNacionalEvent.emit(pageEvent)
    this.cdr.detectChanges();
  }
}
