import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { IPreloaderState } from '../../store/preloader/preloader.reducer';

@Component({
  selector: 'app-preloader',
  templateUrl: './preloader.component.html',
  styleUrls: ['./preloader.component.scss']
})
export class PreloaderComponent implements OnInit {

  constructor(private store: Store<{ preloader: IPreloaderState }>) { }

  preloader$ = this.store.select('preloader')
    .pipe(
      map(settings => settings)
    )

  ngOnInit(): void {
    //
  }

}
