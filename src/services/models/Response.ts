import { action, observable } from 'mobx';

import { OpenAPIResponse, Referenced } from '../../types';

import { getStatusCodeType } from '../../utils';
import { OpenAPIParser } from '../OpenAPIParser';
import { RedocNormalizedOptions } from '../RedocNormalizedOptions';
import { FieldModel } from './Field';
import { MediaContentModel } from './MediaContent';
import {IIdentifiable} from "../MenuStore";

export class ResponseModel implements IIdentifiable{
  @observable
  expanded: boolean;

  content?: MediaContentModel;
  code: string;
  summary: string;
  description: string;
  type: string;
  headers: FieldModel[] = [];

  constructor(
    parser: OpenAPIParser,
    code: string,
    defaultAsError: boolean,
    infoOrRef: Referenced<OpenAPIResponse>,
    options: RedocNormalizedOptions,
    parent: IIdentifiable
  ) {
    this.expanded = options.expandResponses === 'all' || options.expandResponses[code];

    const info = parser.deref(infoOrRef);
    parser.exitRef(infoOrRef);
    this.code = code;

    this.parent = parent;
    this.id = this.getId();

    if (info.content !== undefined) {
      this.content = new MediaContentModel(parser, info.content, false, options, this);
    }

    if (info['x-summary'] !== undefined) {
      this.summary = info['x-summary'];
      this.description = info.description || '';
    } else {
      this.summary = info.description || '';
      this.description = '';
    }

    this.type = getStatusCodeType(code, defaultAsError);

    const headers = info.headers;
    if (headers !== undefined) {
      this.headers = Object.keys(headers).map(name => {
        const header = headers[name];
        return new FieldModel(parser, { ...header, name }, '', options, this);
      });
    }
  }

  id: string;
  parent?: IIdentifiable;
  targetOneOf?: number;
  getId(): string {
      return this.parent?.getId() + "/" + this.code.toString();
  }

  @action
  toggle() {
    this.expanded = !this.expanded;
  }
}
