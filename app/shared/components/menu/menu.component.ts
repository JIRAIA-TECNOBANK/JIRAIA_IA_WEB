import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuService } from '../../services/menu.service';
import { Menu } from './menu.model';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  constructor(
    private menuService: MenuService,
    private eRef: ElementRef,
    private router: Router
  ) {}

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (
      !this.eRef.nativeElement.contains(event.target) &&
      event.path?.find((p) => p.className == 'sidebar') == undefined
    ) {
      if (
        event.path?.find((classe) => classe.id == 'menuHamburger') == undefined
      ) {
        if (this.activeMenu) {
          this.menuService.activateMenu(false);
        }
      }
    }
  }

  activeMenu: boolean = false;
  menuItems: Menu[] = [
    {
      id: 'dashboard',
      icon: 'fa-regular fa-objects-column',
      label: 'Dashboard',
      active: false,
      link: '/',
    },
    {
      id: 'empresas',
      icon: 'fa-regular fa-buildings',
      label: 'Empresas e grupos',
      active: false,
      link: '/organizacoes',
    },
    {
      id: 'acessos',
      icon: 'fa-regular fa-user-large',
      label: 'Acessos',
      active: false,
      link: '',
      child: [
        {
          id: 'usuarios',
          label: 'Usuários',
          active: false,
          link: '/usuarios',
        },
        {
          id: 'areas',
          label: 'Áreas',
          active: false,
          link: '/areas',
        },
        {
          id: 'perfis',
          label: 'Perfis',
          active: false,
          link: '/perfis',
        },
      ],
    },
    {
      id: 'relatorios',
      icon: 'fa-solid fa-chart-mixed',
      label: 'Relatórios',
      active: false,
      link: '',
      child: [
        {
          id: 'relatoriosGerados',
          label: 'Relatórios gerados',
          active: false,
          link: '/relatorios',
          parentId: 'relatorios',
        },
      ],
    },
    {
      id: 'operacional',
      icon: 'fa-regular fa-pencil',
      label: 'Operacional',
      active: false,
      link: '',
      child: [
        {
          id: 'consultarOperacoes',
          label: 'Monitor de operações e lotes',
          active: false,
          link: '/monitor-operacoes-lotes',
          parentId: 'operacional',
        },
        {
          id: 'confirmar-registros',
          label: 'Confirmar registros',
          active: false,
          link: '/confirmar-registros',
          parentId: 'operacional',
        },
        {
          id: 'notificacoes',
          label: 'Notificações',
          active: false,
          link: '/notificacoes',
          parentId: 'operacional',
        },
        {
          id: 'gestao-dudas',
          label: 'Gestão de DUDAs',
          active: false,
          link: '/gestao-dudas',
          parentId: 'operacional',
        },
        {
          id: 'conexao-detrans',
          label: 'Conexão com DETRANs',
          active: false,
          link: '/conexao-detrans',
          parentId: 'operacional',
        },
        {
          id: 'central-ajuda',
          label: 'Central de ajuda',
          active: false,
          link: '/central-ajuda',
          parentId: 'operacional',
        },
        {
          id: 'usuarios-conectados',
          label: 'Usuários conectados',
          active: false,
          link: '/usuarios-conectados',
          parentId: 'operacional',
        },
      ],
    },
    {
      id: 'financeiro',
      icon: 'fa-regular fa-dollar-sign',
      label: 'Financeiro',
      active: false,
      link: '',
      child: [
        {
          id: 'gestao-aprovacoes',
          label: 'Gestão de aprovações',
          active: false,
          link: '/gestao-aprovacoes',
          parentId: 'financeiro',
        },
        {
          id: 'monitor-faturamento',
          label: 'Monitor de faturamento',
          active: false,
          link: '/monitor-faturamento',
          parentId: 'financeiro',
        },
        {
          id: 'gestao-detran',
          label: 'Gestão de DETRANs',
          active: false,
          link: '/gestao-detrans',
          parentId: 'financeiro',
        },
        {
          id: 'relatorios-faturamento',
          label: 'Relatórios',
          active: false,
          link: '/relatorios-faturamento',
          parentId: 'financeiro',
        },
        {
          id: 'upload-detran',
          label: 'Upload de arquivo DETRAN',
          active: false,
          link: '/upload-detran',
          parentId: 'financeiro',
        }
      ]
    },
    {
      id: 'juridico',
      icon: 'fa-regular fa-book-section',
      label: 'Regulatório',
      active: false,
      link: '',
      child: [
        {
          id: 'chat',
          label: 'Chat',
          active: false,
          link: '/hackaton-chat',
          parentId: 'juridico',
        },
        {
          id: 'monitor-normativo',
          label: 'Monitor de Normativo',
          active: false,
          link: '/monitor-normativo',
          parentId: 'juridico',
        },
        {
          id: 'monitor-regulatorio',
          label: 'Monitor regulatório',
          active: false,
          link: '/monitor-regulatorio',
          parentId: 'juridico',
        },
        {
          id: 'normativos',
          label: 'Normativos',
          active: false,
          link: '/normativos',
          parentId: 'juridico',
        },
        {
          id: 'registros',
          label: 'Registros',
          active: false,
          link: '/registros',
          parentId: 'juridico',
        },
        {
          id: 'contato',
          label: 'Registro de contato',
          active: false,
          link: '/contatos',
          parentId: 'juridico',
        },
      ],
    },
    {
      id: 'eGarantia',
      label: 'eGarantia',
      active: false,
      icon: 'fa-regular fa-car-building',
      link: '',
      parentId: 'configuracoes-produtos',
      child: [
        {
          id: 'detrans',
          label: 'Detrans',
          active: false,
          link: '/egarantia-detrans',
          parentId: '',
        },
        {
          id: 'aplicacoes',
          label: 'Aplicações',
          active: false,
          link: '/egarantia-aplicacoes',
          parentId: 'eGarantia',
        },
        {
          id: 'protocolos',
          label: 'Protocolos',
          active: false,
          link: '/egarantia-protocolos',
          parentId: 'eGarantia',
        }
      ],
    },
    {
      id: 'configuracoes',
      icon: 'fa-regular fa-gear',
      label: 'Configurações',
      active: false,
      link: '',
      child: [
        {
          id: 'configuracoes-econtrato',
          label: 'Produtos',
          active: false,
          link: '',
          parentId: 'configuracoes',
          child: [
            {
              id: 'configuracoes-produtos-econtrato',
              label: 'eContrato',
              active: false,
              link: '',
              parentId: 'configuracoes-produtos',
              child: [
                {
                  id: 'configuracoes-produtos-imagens',
                  label: 'Imagens',
                  active: false,
                  link: '/configuracoes/e-contrato/configuracoes-imagens',
                  parentId: 'configuracoes-produtos-econtrato',
                },
                {
                  id: 'gestao-banners',
                  label: 'Gestão de banners',
                  active: false,
                  link: '/configuracoes/e-contrato/gestao-banners',
                  parentId: 'configuracoes-produtos-econtrato',
                },
                {
                  id: 'marcas-modelos',
                  label: 'Marcas e modelos',
                  active: false,
                  link: '/configuracoes/e-contrato/marcas-modelos',
                  parentId: 'configuracoes-produtos-econtrato',
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  ngOnInit(): void {
    this.menuService.activeMenu$.subscribe((menu) => {
      this.activeMenu = menu;
      if (!this.activeMenu) {
        let itemAtivo = this.menuItems.filter((item) => item.active)[0];
        if (itemAtivo) {
          itemAtivo.active = false;
        }
      }
    });
  }

  toggleItem(itemId: string) {
    let menuItem = this.menuItems.filter((item) => item.id == itemId)[0];
    if (menuItem.child != null) {
      if (!menuItem.active) {
        let itemAtivo = this.menuItems.filter(
          (item) =>
            item.id != itemId && item.id != menuItem.parentId && item.active
        )[0];
        if (itemAtivo != undefined) {
          itemAtivo.active = false;
        }

        this.menuService.activateMenu(true);
      }

      this.menuItems.filter((item) => item.id == itemId)[0].active =
        !menuItem.active;
    }
  }

  clickLink(event, menuItem: Menu) {
    if (menuItem.link == '') {
      this.toggleItem(menuItem.id);
      return;
    }

    this.router.navigate([`${menuItem.link}`]);
    this.menuService.activateMenu(false);
  }
}
