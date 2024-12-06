import { Component } from '@angular/core';
import { Observable, catchError, map, merge, of, startWith, switchMap } from 'rxjs';
import { ObterUsuariosOnlineResponse } from '../../../core/responses/usuarios-empresa/obter-usuarios-online.response';
import { UsuariosOnline } from '../../../core/models/usuarios-empresa/usuarios-online.model';
import { UsuariosEmpresaService } from '../../../services/usuarios-empresa.service';

@Component({
  selector: 'app-usuarios-conectados',
  templateUrl: './usuarios-conectados.component.html',
  styleUrls: ['./usuarios-conectados.component.scss']
})
export class UsuariosConectadosComponent {

  items$: Observable<UsuariosOnline[]>;
  displayedColumns: string[] = ['nome', 'email', 'ambiente'];
  temUsuarios: boolean = true;
  carregandoSkeleton: boolean = true;

  constructor(private usuariosEmpresaService: UsuariosEmpresaService) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.carregaGridUsuariosOnline();
  }

  carregaGridUsuariosOnline() {
    this.items$ = merge().pipe(
      startWith({}),
      switchMap(() => {
        this.carregandoSkeleton = true;
        return this.listarUsuarios();
      }),
      map((result: { usuarios: UsuariosOnline[] }) => {
        this.carregandoSkeleton = false;
        result.usuarios ?? (this.temUsuarios = false);
        return result.usuarios;
      }),
      catchError((err) => {
        console.info(err);
        this.carregandoSkeleton = false;
        this.temUsuarios = false;
        return of([]);
      })
    );
  }

  listarUsuarios(): Observable<ObterUsuariosOnlineResponse> {
    return this.usuariosEmpresaService.obterUsuariosOnline();
  }

}
