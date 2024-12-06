import {
  AbstractControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import * as moment from 'moment';
import { NgxMaskService } from 'ngx-mask';
import { Documento } from 'src/app/modules/sistemas/core/models/documento.model';
import { appInjector } from 'src/app/modules/sistemas/sistemas.module';
import { Empresas } from 'src/app/modules/sistemas/sub-modules/crm/core/models/empresas/empresas.model';
import { TipoElemento } from '../enums/tipo-elemento.enum';
import { PermissoesSistema } from './permissoes-sistema';
import { RotasAuxiliares } from './rotas-auxiliares';
import { StatusArquivoNormativo } from 'src/app/modules/sistemas/sub-modules/juridico/core/model/arquivo-normativo.model';

export class Utility {
  static formatDate(value: string): string {
    if (value == null || value == undefined || value == '') return '';
    return moment(value, 'DD-MM-YYYY').format('DD-MM-YYYY');
  }

  static formatDatePicker(value: string, splitChar: string = '-'): any {
    let dateSplit = value.split(splitChar);
    if (value == null || value == undefined || value == '') return null;

    return new Date(
      Number(dateSplit[2]),
      Number(dateSplit[1]) - 1,
      Number(dateSplit[0])
    );
  }

  static formatCurrency(value: string): string {
    if (value == null || value == undefined || value == '') return '';

    const maskService = appInjector.get(NgxMaskService);

    maskService.decimalMarker = '.';
    maskService.thousandSeparator = ',';
    maskService.prefix = 'R$ ';

    let currency = maskService.applyMask(
      parseFloat(value).toFixed(2),
      'separator.2'
    );

    currency = currency.replace(',', '-');
    currency = currency.replace('.', ',');
    currency = currency.replace('-', '.');

    return currency;
  }

  static currentYear(): number {
    return new Date().getFullYear();
  }

  static formatCnpj(value: string): string {
    if (value == null || value == undefined || value == '') return '';

    let maskService = appInjector.get(NgxMaskService);

    maskService.prefix = '';

    return maskService.applyMask(value, '00.000.000/0000-00');
  }

  static formatCpf(value: string): string {
    if (value == null || value == undefined || value == '') return '';

    let maskService = appInjector.get(NgxMaskService);

    maskService.prefix = '';

    return maskService.applyMask(value, '000.000.000-00');
  }

  /**
   * Executa a função após o tempo determinado
   * @param {function} action
   * @param {number} ms
   */
  static waitFor(action: () => void, ms: number): void {
    setTimeout(() => {
      action();
    }, ms);
  }

  /**
 * Executa a função a cada ms (tempo determinado) até que a função retorne verdadeiro
 * @param {function} action
 * @param {number} ms
 */
  static watchCondition(timer: NodeJS.Timeout, action: () => boolean, ms: number): void {
    timer = setInterval(() => {
      if (action()) { Utility.stopWatchCondition(timer); }
    }, ms);
  }

  static stopWatchCondition(timer: NodeJS.Timeout) {
    clearInterval(timer);
  }

  static isValidDate() {
    return (control: AbstractControl): Validators => {
      let ctrlValue = control.value;

      if (ctrlValue) {
        if (!ctrlValue.includes('-')) {
          ctrlValue =
            ctrlValue.substring(0, 2) +
            '-' +
            ctrlValue.substring(2, 4) +
            '-' +
            ctrlValue.substring(4, 8);
        }

        var day: number = +ctrlValue.substring(0, 2);
        var month: number = +ctrlValue.substring(3, 5);
        var year: number = +ctrlValue.substring(6, 10);

        if (day <= 0 || month <= 0 || year < 1971 || year > 2999) {
          return { dateNotValid: true };
        }
      }
      return null;
    };
  }

  static isValidCpf() {
    return (control: AbstractControl): Validators => {
      let cpf = control.value;

      if (cpf) {
        let numbers, digits, sum, i, result, equalDigits;
        equalDigits = 1;

        if (cpf.length < 11) {
          return { documentNotValid: true };
        }

        cpf = cpf.replace('.', '').replace('.', '').replace('-', '');

        for (i = 0; i < cpf.length - 1; i++) {
          if (cpf.charAt(i) !== cpf.charAt(i + 1)) {
            equalDigits = 0;
            break;
          }
        }

        if (
          cpf == '00000000000' ||
          cpf == '11111111111' ||
          cpf == '22222222222' ||
          cpf == '33333333333' ||
          cpf == '44444444444' ||
          cpf == '55555555555' ||
          cpf == '66666666666' ||
          cpf == '77777777777' ||
          cpf == '88888888888' ||
          cpf == '99999999999'
        )
          return { documentNotValid: true };

        if (!equalDigits) {
          numbers = cpf.substring(0, 9);
          digits = cpf.substring(9);
          sum = 0;
          for (i = 10; i > 1; i--) {
            sum += numbers.charAt(10 - i) * i;
          }

          result = sum % 11 < 2 ? 0 : 11 - (sum % 11);

          if (result !== Number(digits.charAt(0))) {
            return { documentNotValid: true };
          }
          numbers = cpf.substring(0, 10);
          sum = 0;

          for (i = 11; i > 1; i--) {
            sum += numbers.charAt(11 - i) * i;
          }
          result = sum % 11 < 2 ? 0 : 11 - (sum % 11);

          if (result !== Number(digits.charAt(1))) {
            return { documentNotValid: true };
          }
          return null;
        } else {
          return { documentNotValid: true };
        }
      }
      return null;
    };
  }

  static isValidCnpj() {
    return (control: AbstractControl): Validators => {
      const value = control.value;

      if (!value) return null;

      let cnpj = value.replace(/[^\d]+/g, '');
      if (cnpj == '') return { documentNotValid: true };
      if (cnpj.length != 14) return { documentNotValid: true };

      if (
        cnpj == '00000000000000' ||
        cnpj == '11111111111111' ||
        cnpj == '22222222222222' ||
        cnpj == '33333333333333' ||
        cnpj == '44444444444444' ||
        cnpj == '55555555555555' ||
        cnpj == '66666666666666' ||
        cnpj == '77777777777777' ||
        cnpj == '88888888888888' ||
        cnpj == '99999999999999'
      )
        return { documentNotValid: true };

      let tamanho = cnpj.length - 2;
      let numeros = cnpj.substring(0, tamanho);
      let digitos = cnpj.substring(tamanho);
      let soma = 0;
      let pos = tamanho - 7;
      for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
      }
      let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
      if (resultado != digitos.charAt(0)) return { documentNotValid: true };

      tamanho = tamanho + 1;
      numeros = cnpj.substring(0, tamanho);
      soma = 0;
      pos = tamanho - 7;
      for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
      }
      resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
      if (resultado != digitos.charAt(1)) return { documentNotValid: true };

      return null;
    };
  }

  static formatDocument(documento: Documento) {
    if (documento.tipoDocumento == 1) {
      return documento.numero.replace(
        /(\d{3})?(\d{3})?(\d{3})?(\d{2})/,
        '$1.$2.$3-$4'
      );
    }

    return documento.numero.replace(
      /(\d{2})?(\d{3})?(\d{3})?(\d{4})?(\d{2})/,
      '$1.$2.$3/$4-$5'
    );
  }

  static formatCep(cep: string) {
    return cep.replace(/(\d{5})?(\d{3})/, '$1-$2');
  }

  static formatCurrencyValue(valor: number) {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  static isNullOrEmpty(value: string) {
    return value == '' || value == null;
  }

  static changeFieldValidators(
    form: FormGroup,
    field: string,
    validators: ValidatorFn[]
  ) {
    form.get(field).reset();
    form.get(field).setValidators(validators);
    form.get(field).updateValueAndValidity();
  }

  static dynamicValidator(condition: () => boolean, invalidIdentifier: string) {
    return (control: AbstractControl): Validators => {
      if (!condition()) return { invalidIdentifier: invalidIdentifier };
      return null;
    };
  }

  static formatGridDate(date: string) {
    if (date == undefined) return;
    if (Utility.isNullOrEmpty(date)) return;

    return date.slice(0, date.length - 3);
  }

  static isValidEmailTBK() {
    return (control: AbstractControl): Validators => {
      let email = control.value;

      if (email) {
        let dominio = email.split('@')[1]?.toLowerCase();
        if (dominio != 'tecnobank.com.br')
          return { emailTBKInvalid: true };
      }
      return null;
    };
  }

  static isValidName() {
    return (control: AbstractControl): Validators => {
      let nome: string = control.value;

      if (nome) {
        if (nome.toUpperCase() == 'MASTER' || nome.toUpperCase() == 'MÁSTER')
          return { nameInvalid: true };
      }
      return null;
    };
  }

  static getElementId(
    tipoElemento: TipoElemento,
    nomeElemento: string,
    guidElemento: any = null
  ) {
    return `${TipoElemento[tipoElemento]}-${nomeElemento}${guidElemento != null ? '_' + guidElemento : ''
      }`;
  }

  static formatDateTime(value: string): string {
    if (value == null || value == undefined || value == '') return null;
    return moment(value).format('DD-MM-YYYY [às] HH:mm');
  }

  static checkNumbersOnly(filtro: string) {
    if (!filtro) return '';

    let retorno = filtro;
    let numbers = +retorno.replace(/[^a-zA-Z\d]*/g, '');

    if (!isNaN(numbers)) {
      return numbers.toString();
    }

    return filtro.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  static getPermission(palavraChave: string[]) {
    let listaPermissoes = PermissoesSistema.retornarPermissoesSistema;
    for (let i = 0; i < palavraChave.length; i++) {
      if (
        listaPermissoes.filter((p) => p.palavraChave === palavraChave[i])
          .length > 0
      )
        return true;
    }

    return false;
  }

  static checkDocument() {
    return (control: AbstractControl): Validators => {
      let retorno = control.value;

      if (retorno) {
        let numbers = +retorno.replace(/[^a-zA-Z\d]*/g, '');
        if (isNaN(numbers)) return { documentInvalid: true };

        return null;
      }
      return null;
    };
  }

  static modoConsulta(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((control) =>
      formGroup.get(control).disable()
    );
  }

  static verificaPermissaoRota(permission: string[]) {
    let access: boolean = false;
    let permissionList = PermissoesSistema.retornarPermissoesSistema;

    for (let permissao of permission) {
      if (permissionList.filter(p => p.palavraChave.startsWith(permissao)).length > 0) access = true;
    }

    return access;
  }

  static reloadPage() {
    window.location.reload();
  }

  static loadRotasInativas() {
    let retorno = [];
    Object.keys(RotasAuxiliares).forEach(rota => retorno.push(rota));

    return retorno;
  }

  static sortValues(listValues: any[], field?: string): any[] {
    return listValues.sort(function (a, b) {
      let textA = '';
      let textB = '';

      if (field) {
        textA = a[field].toUpperCase();
        textB = b[field].toUpperCase();
      }
      else {
        textA = a.toUpperCase();
        textB = b.toUpperCase();
      }

      if (textA < textB) return -1;
      if (textA > textB) return 1;
      return 0;
    });
  }

  static toggleAllRows(selection: any, dataSource: any, field: string): void {
    if (Utility.verifyPageSelection(selection, dataSource, field) == 1) {
      dataSource.data.forEach((data) => {
        selection.deselect(selection.selected.filter((s) => s[field] == data[field])[0]);
      });
      return;
    }

    if (selection.selected.length > 0) {
      let selecionados = [];
      dataSource.data.forEach((data) => {
        if (
          selection.selected.filter((s) => s[field] == data[field])
            .length > 0
        ) {
          selecionados.push(data[field]);
        }
      });
      selection.select(...dataSource.data.filter(
        (data) => selecionados.filter((s) => s == data[field]).length == 0)
      );
      return;
    }

    selection.select(...dataSource.data);
  }

  static verifyPageSelection(selection: any, dataSource: any, field: string): number {
    let idsPagina = [];
    let idsSelecionados = [];

    if (selection.selected.length == 0) return 0;

    dataSource.data.forEach((data) => {
      idsPagina.push(data[field]);

      let selecionado = selection.selected.filter((s) => s[field] == data[field])[0];
      if (selecionado) {
        idsSelecionados.push(selecionado[field]);
      }
    });

    if (idsPagina.length == idsSelecionados.length) {
      return 1; // todos os itens estao selecionados
    }
    if (idsSelecionados.length > 0) {
      return 2; // alguns itens estao selecionados
    }
    return 0; // nenhum item esta selecionado
  }

  static check(selection: any, row: any, field: string): void {
    if (selection.selected.length > 0) {
      if (selection.selected.filter((s) => s[field] == row[field]).length > 0) {
        selection.deselect(selection.selected.filter((s) => s[field] == row[field])[0]);
        return;
      }
    }

    selection.select(row);
  }

  static isSelected(selection: any, row: any, field: string): boolean {
    if (selection.selected.length > 0) {
      return (
        selection.selected.filter((r) => r[field] == row[field]).length > 0
      );
    }

    return selection.isSelected(row);
  }

  static retornarTipoOperacao(operacao: string): string {
    let tipoOperacao = +operacao;

    if (tipoOperacao === 1) {
      return 'Registro de contrato';
    }

    if (tipoOperacao === 2) {
      return 'Alteração de contrato';
    }

    if (tipoOperacao === 3) {
      return 'Registro de aditivo';
    }

    if (tipoOperacao === 4) {
      return 'Alteração de aditivo';
    }
  }

  static getClienteNomeCnpj(cliente: Empresas) {
    let cnpj = <Documento>{ numero: cliente.cnpj, tipoDocumento: 2 };
    return `${cliente.nomeFantasia} (${Utility.formatDocument(cnpj)})`;
  }

  static getClienteNomeCnpjRazaoSocial(cliente: Empresas) {
    let cnpj = <Documento>{ numero: cliente.cnpj, tipoDocumento: 2 };
    return `${cliente.razaoSocial} (${Utility.formatDocument(cnpj)})`;
  }

  static listaNomesMesas() {
    return [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro'
    ];
  }

  /**
 * Formata os bytes
 * @param bytes (Tamanho do arquivo em bytes)
 * @param decimals (Pontos decimais)
 */
  static formatBytes(bytes, decimals = 2) {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1000;
    const dm = decimals <= 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    let size = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

    return size + ' ' + sizes[i];
  }
  /**
 * Formata os bytes em MB
 * @param bytes (Tamanho do arquivo em bytes)
 */
  static formatMegabytes(bytes) {
    if (bytes === 0) {
      return 0;
    }

    let megabytes = bytes / 1024 / 1024;
    return megabytes;
  }

  /**
 * Formata o nome ou a sigla do estado.
 * @param UF exemplo: SP ou São Paulo
 */
  static converterUfParaSiglaENome(input: string): string | null {
    if (input == null) {
      return null;
    }

    const toAbbr = input.length !== 2;

    const estados = [
      ['Acre', 'AC'],
      ['Alagoas', 'AL'],
      ['Amapá', 'AP'],
      ['Amazonas', 'AM'],
      ['Bahia', 'BA'],
      ['Ceará', 'CE'],
      ['Distrito Federal', 'DF'],
      ['Espírito Santo', 'ES'],
      ['Goiás', 'GO'],
      ['Maranhão', 'MA'],
      ['Mato Grosso', 'MT'],
      ['Mato Grosso Do Sul', 'MS'],
      ['Minas Gerais', 'MG'],
      ['Pará', 'PA'],
      ['Paraíba', 'PB'],
      ['Paraná', 'PR'],
      ['Pernambuco', 'PE'],
      ['Piauí', 'PI'],
      ['Rio De Janeiro', 'RJ'],
      ['Rio Grande Do Norte', 'RN'],
      ['Rio Grande Do Sul', 'RS'],
      ['Rondônia', 'RO'],
      ['Roraima', 'RR'],
      ['Santa Catarina', 'SC'],
      ['São Paulo', 'SP'],
      ['Sergipe', 'SE'],
      ['Tocantins', 'TO']
    ];

    let i: number = 0;

    if (toAbbr) {
      for (i = 0; i < estados.length; i++) {
        if (estados[i][0] === input) {
          return estados[i][1];
        }
      }
    } else {
      input = input.toUpperCase();
      for (i = 0; i < estados.length; i++) {
        if (estados[i][1] === input) {
          return estados[i][0];
        }
      }
    }

    return null;
  }

  static getStatusDescricaoArquivoNormativo(status: number): string {
    switch (status) {
      case StatusArquivoNormativo.AguardandoAprovacao:
        return "Aguardando aprovação";
      case StatusArquivoNormativo.Processando:
        return "Processando";
      case StatusArquivoNormativo.Aprovado:
        return "Aprovado";
      case StatusArquivoNormativo.Rejeitado:
        return "Rejeitado";
      default:
        return "Status Desconhecido";
    }
  }

  static converterBase64ParaArquivo(base64String: string, fileName: string, mimeType: string): File {
    const byteString = atob(base64String);

    const byteArray = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      byteArray[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([byteArray], { type: mimeType });

    return new File([blob], fileName, { type: mimeType });
  }
}
