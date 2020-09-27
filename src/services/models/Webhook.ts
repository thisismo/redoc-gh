import { OpenAPIPath, Referenced } from '../../types';
import { OpenAPIParser } from '../OpenAPIParser';
import { OperationModel } from './Operation';
import {IMenuItem, isOperationName} from '../..';
import { RedocNormalizedOptions } from '../RedocNormalizedOptions';

export class WebhookModel {
  operations: OperationModel[] = [];

  constructor(
    parser: OpenAPIParser,
    options: RedocNormalizedOptions,
    parent?: IMenuItem,
    infoOrRef?: Referenced<OpenAPIPath>
  ) {
    const webhooks = parser.deref<OpenAPIPath>(infoOrRef || {});
    parser.exitRef(infoOrRef);

    for (const webhookName of Object.keys(webhooks)) {
      const webhook = webhooks[webhookName];
      const operations = Object.keys(webhook).filter(isOperationName);
      for (const operationName of operations) {
        const operationInfo = webhook[operationName];
        const operation = new OperationModel(
          parser,
          {
            ...operationInfo,
            httpVerb: operationName,
          },
          parent,
          options,
          false,
        );

        this.operations.push(operation);
      }
    }
  }
}
