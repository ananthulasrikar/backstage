/*
 * Copyright 2021 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Entity, UserEntity } from '@backstage/catalog-model';
import { EntityFilter, UserListFilterKind } from './types';
import { isOwnerOf } from './utils';

export class EntityKindFilter implements EntityFilter {
  constructor(readonly value: string) {}

  getCatalogFilters(): Record<string, string | string[]> {
    return { kind: this.value };
  }
}

export class EntityTypeFilter implements EntityFilter {
  constructor(readonly value: string) {}

  getCatalogFilters(): Record<string, string | string[]> {
    return { 'spec.type': this.value };
  }
}

export class EntityTagFilter implements EntityFilter {
  constructor(readonly values: string[]) {}

  filterEntity(entity: Entity): boolean {
    return this.values.every(v => (entity.metadata.tags ?? []).includes(v));
  }
}

export class EntityTextFilter implements EntityFilter {
  constructor(readonly value: string) {}

  filterEntity(entity: Entity): boolean {
    const upperCaseValue = this.value.toLocaleUpperCase('en-US');

    return (
      entity.metadata.name
        .toLocaleUpperCase('en-US')
        .includes(upperCaseValue) ||
      `${entity.metadata.title}`
        .toLocaleUpperCase('en-US')
        .includes(upperCaseValue) ||
      entity.metadata.tags
        ?.join('')
        .toLocaleUpperCase('en-US')
        .indexOf(upperCaseValue) !== -1
    );
  }
}

export class UserListFilter implements EntityFilter {
  constructor(
    readonly value: UserListFilterKind,
    readonly user: UserEntity | undefined,
    readonly isStarredEntity: (entity: Entity) => boolean,
  ) {}

  filterEntity(entity: Entity): boolean {
    switch (this.value) {
      case 'owned':
        return this.user !== undefined && isOwnerOf(this.user, entity);
      case 'starred':
        return this.isStarredEntity(entity);
      default:
        return true;
    }
  }
}
