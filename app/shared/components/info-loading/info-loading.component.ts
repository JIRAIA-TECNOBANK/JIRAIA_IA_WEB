import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { IInfoLoadingState } from '../../store/info-loading/info-loading.reducer';

@Component({
  selector: 'app-info-loading',
  templateUrl: './info-loading.component.html',
  styleUrls: ['./info-loading.component.scss']
})
export class InfoLoadingComponent implements OnInit {

  constructor(private store: Store<{ infoLoading: IInfoLoadingState }>) { }

  message$ = this.store.select('infoLoading')
    .pipe(map(m => m));

  ngOnInit(): void {
    //
  }

}
