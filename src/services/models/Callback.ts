import { action, observable } from 'mobx';

import { OpenAPICallback, Referenced } from '../../types';
import { isOperationName, JsonPointer } from '../../utils';
import { OpenAPIParser } from '../OpenAPIParser';
import { OperationModel } from './Operation';
import { RedocNormalizedOptions } from '../RedocNormalizedOptions';
import {IMenuItem} from "../MenuStore";

export class CallbackModel /*implements IIdentifiable*/ {
  @observable
  expanded: boolean;
  name: string;
  operations: OperationModel[] = [];

  constructor(
    parser: OpenAPIParser,
    name: string,
    infoOrRef: Referenced<OpenAPICallback>,
    pointer: string,
    options: RedocNormalizedOptions,
    parent?: IMenuItem
  ) {
    this.name = name;
    const paths = parser.deref<OpenAPICallback>(infoOrRef);
    parser.exitRef(infoOrRef);
    /*this.parent = parent;
    this.id = this.getId();*/

    for (const pathName of Object.keys(paths)) {
      const path = paths[pathName];
      const operations = Object.keys(path).filter(isOperationName);
      for (const operationName of operations) {
        const operationInfo = path[operationName];

        const operation = new OperationModel(
          parser,
          {
            ...operationInfo,
            pathName,
            pointer: JsonPointer.compile([pointer, name, pathName, operationName]),
            httpVerb: operationName,
            pathParameters: path.parameters || [],
            pathServers: path.servers,
          },
          parent,
          options,
          true,
        );

        this.operations.push(operation);
      }
    }
  }

  /*id: string;
  parent?: IIdentifiable;
  targetOneOf?: number;
  getId(): string {
      return this.parent?.getId() + "/callback" + this.name.toLowerCase().replace(" ", "_");
  }*/

  @action
  toggle() {
    this.expanded = !this.expanded;
  }
}
