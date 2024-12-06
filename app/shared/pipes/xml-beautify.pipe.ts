import { Pipe, PipeTransform } from '@angular/core';
import * as vkbeautify from 'vkbeautify';

@Pipe({
  name: 'xmlBeautify'
})
export class XmlBeautifyPipe implements PipeTransform {
  transform(value: string, ...args: any[]): string {
    return vkbeautify.xml(value);
  }
}
