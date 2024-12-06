import { Pipe, PipeTransform } from '@angular/core';
import * as vkbeautify from 'vkbeautify';

@Pipe({
  name: 'jsonBeautify'
})
export class JsonBeautifyPipe implements PipeTransform {

  transform(value: string, ...args: any[]): string {
    return vkbeautify.json(value);
  }

}
