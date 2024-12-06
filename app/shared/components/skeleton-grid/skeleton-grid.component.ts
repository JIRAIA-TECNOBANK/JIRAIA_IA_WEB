import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-skeleton-grid',
  templateUrl: './skeleton-grid.component.html',
  styleUrls: ['./skeleton-grid.component.scss']
})
export class SkeletonGridComponent implements OnInit {

  constructor() {
    //
   }

  @Input('colunas') colunas: string[];

  loading: boolean = true;

  ngOnInit(): void {
    //
  }

}
