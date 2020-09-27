import { OpenAPIRequestBody, Referenced } from '../../types';

import { OpenAPIParser } from '../OpenAPIParser';
import { RedocNormalizedOptions } from '../RedocNormalizedOptions';
import { MediaContentModel } from './MediaContent';
import {IIdentifiable} from "../MenuStore";

export class RequestBodyModel implements IIdentifiable {
  description: string;
  required: boolean;
  content?: MediaContentModel;

  constructor(
    parser: OpenAPIParser,
    infoOrRef: Referenced<OpenAPIRequestBody>,
    options: RedocNormalizedOptions,
    parent: IIdentifiable
  ) {
    const info = parser.deref(infoOrRef);
    this.description = info.description || '';
    this.required = !!info.required;

    this.parent = parent;
    this.id = this.getId();
    console.log("body", this.getId(), this.parent);

    parser.exitRef(infoOrRef);
    if (info.content !== undefined) {
      this.content = new MediaContentModel(parser, info.content, true, options, this);
    }
  }

  id: string;
  parent: IIdentifiable;
  targetOneOf: number;

  getId(): string {
    return this.parent?.getId() + "/body";
  }
}
