import { action, computed, observable } from 'mobx';

import { OpenAPIMediaType } from '../../types';
import { MediaTypeModel } from './MediaType';

import { mergeSimilarMediaTypes } from '../../utils';
import { OpenAPIParser } from '../OpenAPIParser';
import { RedocNormalizedOptions } from '../RedocNormalizedOptions';
import {IIdentifiable} from "../MenuStore";

/**
 * MediaContent model ready to be sued by React components
 * Contains multiple MediaTypes and keeps track of the currently active one
 */
export class MediaContentModel implements IIdentifiable {
  mediaTypes: MediaTypeModel[];

  @observable
  activeMimeIdx = 0;

  /**
   * @param isRequestType needed to know if skipe RO/RW fields in objects
   */
  constructor(
    parser: OpenAPIParser,
    info: Record<string, OpenAPIMediaType>,
    public isRequestType: boolean,
    options: RedocNormalizedOptions,
    parent: IIdentifiable
  ) {
    if (options.unstable_ignoreMimeParameters) {
      info = mergeSimilarMediaTypes(info);
    }
    this.parent = parent;
    this.mediaTypes = Object.keys(info).map((name, idx) => {
      const mime = info[name];
      // reset deref cache just in case something is left there
      parser.resetVisited();
      return new MediaTypeModel(parser, name, isRequestType, mime, options, this, undefined, idx);
    });
  }

  /**
   * Set active media type by index
   * @param idx media type index
   */
  @action
  activate(idx: number) {
    this.activeMimeIdx = idx;
  }

  @computed
  get active() {
    return this.mediaTypes[this.activeMimeIdx];
  }

  get hasSample(): boolean {
    return this.mediaTypes.filter(mime => !!mime.examples).length > 0;
  }

  id: string;
  parent: IIdentifiable;
  targetMimeIdx: number;
  targetOneOf?: number;

  //TODO: Might be buggy
  getId(): string {
    return this.parent.getId();
  }
}
