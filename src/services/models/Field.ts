import { action, observable } from 'mobx';

import {
  OpenAPIParameter,
  OpenAPIParameterLocation,
  OpenAPIParameterStyle,
  Referenced,
} from '../../types';
import { RedocNormalizedOptions } from '../RedocNormalizedOptions';

import { extractExtensions } from '../../utils/openapi';
import { OpenAPIParser } from '../OpenAPIParser';
import { SchemaModel } from './Schema';
import {IIdentifiable, IMenuItem} from "../MenuStore";

const DEFAULT_SERIALIZATION: Record<
  OpenAPIParameterLocation,
  { explode: boolean; style: OpenAPIParameterStyle }
> = {
  path: {
    style: 'simple',
    explode: false,
  },
  query: {
    style: 'form',
    explode: true,
  },
  header: {
    style: 'simple',
    explode: false,
  },
  cookie: {
    style: 'form',
    explode: true,
  },
};

/**
 * Field or Parameter model ready to be used by components
 */
export class FieldModel implements IMenuItem {
  @observable
  expanded: boolean | undefined;

  //Start customization
  id: string;
  active: boolean;
  depth: number;
  items: [];
  type = 'field' as const;
  parent: IIdentifiable;
  targetOneOf: number;

  //End customization

  schema: SchemaModel;
  name: string;
  required: boolean;
  description: string;
  example?: string;
  deprecated: boolean;
  in?: OpenAPIParameterLocation;
  kind: string;
  extensions?: Record<string, any>;
  explode: boolean;
  style?: OpenAPIParameterStyle;

  serializationMime?: string;

  constructor(
    parser: OpenAPIParser,
    infoOrRef: Referenced<OpenAPIParameter> & { name?: string; kind?: string },
    pointer: string,
    options: RedocNormalizedOptions,
    parent: IIdentifiable
  ) {
    const info = parser.deref<OpenAPIParameter>(infoOrRef);
    this.kind = infoOrRef.kind || 'field';
    this.name = infoOrRef.name || info.name;
    this.in = info.in;
    this.required = !!info.required;

    this.parent = parent;
    this.id = this.getId();
    //console.log(this.getId());

    let fieldSchema = info.schema;
    let serializationMime = '';
    if (!fieldSchema && info.in && info.content) {
      serializationMime = Object.keys(info.content)[0];
      fieldSchema = info.content[serializationMime] && info.content[serializationMime].schema;
    }

    this.schema = new SchemaModel(parser, fieldSchema || {}, pointer, options, false, this);
    this.description =
      info.description === undefined ? this.schema.description || '' : info.description;
    this.example = info.example || this.schema.example;

    if (serializationMime) {
      this.serializationMime = serializationMime;
    } else if (info.style) {
      this.style = info.style;
    } else if (this.in) {
      this.style = DEFAULT_SERIALIZATION[this.in]?.style ?? 'form'; // fallback to from in case "in" is invalid
    }

    if (info.explode === undefined && this.in) {
      this.explode = DEFAULT_SERIALIZATION[this.in]?.explode ?? true;
    } else {
      this.explode = !!info.explode;
    }

    this.deprecated = info.deprecated === undefined ? !!this.schema.deprecated : info.deprecated;
    parser.exitRef(infoOrRef);

    if (options.showExtensions) {
      this.extensions = extractExtensions(info, options.showExtensions);
    }
  }

  @action
  toggle() {
    this.expanded = !this.expanded;
  }

  getId(): string {
    return this.parent?.getId() + "/" + this.name;
  }

  absoluteIdx: number;

  activate(): void {
    return;
  }

  collapse(): void {
    return;
  }

  deactivate(): void {
    return;
  }

  expand(): void {
    return;
  }
}
