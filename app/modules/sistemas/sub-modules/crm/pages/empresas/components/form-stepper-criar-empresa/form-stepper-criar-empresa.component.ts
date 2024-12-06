import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { NgTemplateOutlet } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute } from '@angular/router';
import { Utility } from 'src/app/core/common/utility';
interface ButtonMenuList {
  id: FormsCreateCompany;
  buttonName: string;
  isRequired: boolean;
}

enum FormsCreateCompany {
  DadosDeEmpresa = 1,
  Contatos,
  Enderecos,
  Documentos,
  Econtrato
}

@Component({
  selector: 'app-form-stepper-criar-empresa',
  templateUrl: './form-stepper-criar-empresa.component.html',
  styleUrls: ['./form-stepper-criar-empresa.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
})
export class FormStepperCriarEmpresaComponent implements OnInit {
  @ViewChild(MatStepper) stepper: MatStepper;
  @ViewChild('dadosEmpresaTemplate', {})
  dadosEmpresaTemplate?: NgTemplateOutlet;
  @ViewChild('adicionarContatosTemplate', {})
  adicionarContatosTemplate?: NgTemplateOutlet;
  @ViewChild('adicionarEnderecosTemplate', {})
  adicionarEnderecosTemplate?: NgTemplateOutlet;
  @ViewChild('adicionarDocumentosTemplate', {})
  adicionarDocumentosTemplate?: NgTemplateOutlet;


  etapaAtual: number = 0;
  currentTabIndex: number = 0;
  submitLoading: boolean = false;
  menuButton: ButtonMenuList;
  public FormsCreateCompany = FormsCreateCompany;
  utility = Utility;

  buttonsListCompany: ButtonMenuList[] = [
    {
      id: FormsCreateCompany.DadosDeEmpresa,
      buttonName: 'Dados da empresa',
      isRequired: true,
    },
    {
      id: FormsCreateCompany.Contatos,
      buttonName: 'Contatos adicionais',
      isRequired: false,
    },
    {
      id: FormsCreateCompany.Enderecos,
      buttonName: 'Endereços',
      isRequired: false,
    },
    {
      id: FormsCreateCompany.Documentos,
      buttonName: 'Documentos',
      isRequired: false,
    },
  ];

  buttonsListProduct: ButtonMenuList[] = [
    {
      id: FormsCreateCompany.DadosDeEmpresa,
      buttonName: 'e-Contrato',
      isRequired: true,
    },
  ];

  boxInfo = {
    dadosEmpresa: {
      id: 'dados-empresa',
      descricao:
        'Navegue pelas opções laterias e confira se todos os campos obrigatórios foram preenchidos.',
    },
    selecionarProduto: {
      id: 'selecionar-produto',
      descricao:
        'Escolha ao menos um produto para configura-lo na etapa a seguir',
    },
    usuarioMaster: {
      id: 'usuario-master',
      descricao:
        'Essas informações são apenas para consulta e não poderão ser editadas',
    },
  };

  firstStepCompleted: boolean = false;
  companyFormCheck: boolean = false;
  addressFormCheck: boolean = false;

  productBlockEdition: boolean = false;

  companyIdByRouter: number;
  companyIdByRequest: number;
  testeEmitter: number = 1;

  constructor(private activatedRoute: ActivatedRoute) {
    if (this.activatedRoute.snapshot.params['empresaId'] != undefined) {
      this.companyIdByRouter = this.activatedRoute.snapshot.params['empresaId'];
    }
  }

  getCompanyId() {
    return (this.companyIdByRouter || this.companyIdByRequest)
  }

  ngOnInit(): void {
    this.menuButton = this.buttonsListCompany[0];
  }

  onStepChange(event) {
    this.currentTabIndex = event.selectedIndex;
  }

  changeForm(button: ButtonMenuList) {
    this.menuButton = button;
    this.testeEmitter = this.menuButton.id;
  }

  goToNextStep(result) {
    this.menuButton = this.buttonsListCompany[result];
    this.testeEmitter = this.menuButton.id;
  }

  viewComplementaryInfo(isEdition) {
    this.productBlockEdition = isEdition;
  }

  getEmpresaId(id) {
    this.companyIdByRequest = id;
  }
}
